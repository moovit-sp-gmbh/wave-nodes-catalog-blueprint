"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
const crypto_1 = require("crypto");
const high5_1 = require("hcloud-sdk/lib/interfaces/high5");
const execution_1 = require("hcloud-sdk/lib/interfaces/high5/space/execution");
const os_1 = __importDefault(require("os"));
const client_1 = __importDefault(require("../debug/client"));
const StreamResult_1 = require("../models/StreamResult");
const StreamSingleNodeResult_1 = require("../models/StreamSingleNodeResult");
const NodeExecutor_1 = __importDefault(require("./NodeExecutor"));
class StreamRunner {
    static DEBUG_TIMEOUT = 10 * 60 * 1000;
    agentInfo;
    executionPackage;
    streamResult;
    executionStateHelper;
    extraCatalogLocations;
    catalogPath;
    debug;
    debugClient;
    currentNode;
    cleanupFns = [];
    executionStack = [];
    constructor(executionPackage, streamResult, catalogPath, agentInfo) {
        this.executionPackage = executionPackage;
        this.catalogPath = catalogPath;
        if (agentInfo === undefined) {
            agentInfo = {
                os: {
                    platform: os_1.default.platform(),
                    type: os_1.default.type(),
                },
                cpu: os_1.default.cpus()[0].model,
                hostname: os_1.default.hostname(),
            };
        }
        this.agentInfo = agentInfo;
        this.streamResult =
            streamResult ??
                StreamResult_1.StreamResult.create({
                    payload: this.executionPackage.payload,
                    uuid: (0, crypto_1.randomUUID)(),
                    failed: false,
                    nodeResults: [],
                    startTimestamp: Date.now(),
                    runner: this,
                });
        if (executionPackage.debug) {
            this.debug = DebugState.CONTINUE;
            this.debugClient = new client_1.default();
        }
    }
    async process(dry, executionStateHelper, nextNodeUUID, isAdditionalConnector, extraCatalogLocations) {
        this.streamResult.dry = dry;
        this.streamResult.startTimestamp = Date.now();
        this.executionStateHelper = executionStateHelper;
        if (extraCatalogLocations) {
            this.extraCatalogLocations = extraCatalogLocations;
        }
        if (this.executionPackage.debug) {
            return this.processDebug(dry);
        }
        nextNodeUUID = nextNodeUUID ?? this.executionPackage.design.startNode;
        const cleanupFns = [];
        while (nextNodeUUID !== undefined && this.executionStateHelper.getOutcome() !== execution_1.High5ExecutionOutcome.CANCELED) {
            const nodeExecutionResult = await new NodeExecutor_1.default(nextNodeUUID, this.executionPackage, this.streamResult).process(dry, this.executionStateHelper, this, isAdditionalConnector, this.catalogPath, this.extraCatalogLocations);
            executionStateHelper.updateNodeResult(nodeExecutionResult.nodeResult);
            nextNodeUUID = undefined;
            if (nodeExecutionResult.node) {
                if (nodeExecutionResult.nodeResult.failed) {
                    nextNodeUUID = nodeExecutionResult.node.onFail;
                }
                else {
                    nextNodeUUID = nodeExecutionResult.node.onSuccess;
                }
            }
            if (typeof nodeExecutionResult.cleanupFn === "function") {
                cleanupFns.push(nodeExecutionResult.cleanupFn);
            }
        }
        for (let i = cleanupFns.length - 1; i >= 0; i--) {
            await cleanupFns[i]();
        }
        this.streamResult.failed = (this.streamResult.nodeResults?.[this.streamResult.nodeResults.length - 1]?.failed && !isAdditionalConnector) ?? false;
        this.streamResult.endTimestamp = Date.now();
        if (this.streamResult.failed) {
            executionStateHelper.updateStateAndOutcome({
                state: execution_1.High5ExecutionState.COMPLETED,
                outcome: execution_1.High5ExecutionOutcome.FAILED,
            });
        }
        return this.streamResult.lean();
    }
    async processDebug(dry, startNode) {
        if (!startNode) {
            this.currentNode = this.executionPackage.design.nodes.find(n => n.uuid === this.executionPackage.design.startNode);
        }
        nodeExecutionLoop: while (this.currentNode !== undefined && this.executionStateHelper.getOutcome() !== execution_1.High5ExecutionOutcome.CANCELED) {
            const nodeResult = StreamSingleNodeResult_1.StreamSingleNodeResult.create({
                uuid: (0, crypto_1.randomUUID)(),
                nodeUuid: this.currentNode.uuid,
                name: this.currentNode.name,
                failed: false,
                startTimestamp: Date.now(),
                streamNode: this.currentNode,
            });
            this.streamResult.nodeResults.push(nodeResult);
            if (this.currentNode.bypass) {
                nodeResult.bypassed = this.currentNode.bypass;
                this.executionStateHelper.updateNodeResult(nodeResult);
                continue;
            }
            const nodeExecutor = NodeExecutor_1.default.create(this.currentNode, this, nodeResult);
            const executableNode = await nodeExecutor.prepare(this.catalogPath);
            this.executionStateHelper.updateNodeResult(nodeResult);
            nodeResult.executableNode = executableNode;
            const nodeSpec = executableNode.getNodeSpecification();
            if ((0, high5_1.isStreamNodeSpecificationV1)(nodeSpec) || (0, high5_1.isStreamNodeSpecificationV2)(nodeSpec)) {
                this.executionStateHelper.addRunningNode({
                    uuid: this.currentNode.uuid,
                    name: nodeSpec.name,
                    progress: 0,
                    message: "",
                });
            }
            else {
                nodeExecutor.error(new Error(`Unrecognized node specification version ${nodeSpec.specVersion}`));
                return this.streamResult;
            }
            debugLoop: for (;;) {
                let command = undefined;
                if (this.debug === DebugState.STEP) {
                    nodeResult.waiting = true;
                    this.executionStateHelper.updateNodeResult(nodeResult);
                    command = await this.debugClient.wait(StreamRunner.DEBUG_TIMEOUT);
                }
                else if (this.debug === DebugState.CONTINUE && this.currentNode.breakpoint) {
                    nodeResult.waiting = true;
                    this.executionStateHelper.updateNodeResult(nodeResult);
                    command = await this.debugClient.wait(StreamRunner.DEBUG_TIMEOUT);
                }
                else {
                    break debugLoop;
                }
                nodeResult.waiting = false;
                if (command !== undefined) {
                    switch (command.type) {
                        case high5_1.CommandType.CONTINUE:
                            this.debug = DebugState.CONTINUE;
                            break debugLoop;
                        case high5_1.CommandType.STEP_FORWARD:
                            this.debug = DebugState.STEP;
                            break debugLoop;
                        case high5_1.CommandType.STEP_BACK: {
                            this.debug = DebugState.STEP;
                            const prevExec = this.executionStack.pop();
                            if (!prevExec) {
                                break debugLoop;
                            }
                            this.executionStateHelper.removeRunningNode(this.currentNode.uuid);
                            this.executionStateHelper.removeNodeResult(nodeResult.uuid);
                            this.removeNodeResult(nodeResult.uuid);
                            this.currentNode = prevExec.node;
                            this.executionStateHelper.removeNodeResult(prevExec.log.uuid);
                            this.removeNodeResult(prevExec.log.uuid);
                            continue nodeExecutionLoop;
                        }
                        case high5_1.CommandType.SET_VALUE:
                            this.setNodeResultValue(command.uuid, command.key, command.value);
                            break;
                        case high5_1.CommandType.REPLACE_NODE:
                            if (command.node.uuid === this.currentNode.uuid) {
                                this.executionStateHelper.removeRunningNode(this.currentNode.uuid);
                                this.executionStateHelper.removeNodeResult(nodeResult.uuid);
                                this.removeNodeResult(nodeResult.uuid);
                                continue nodeExecutionLoop;
                            }
                            this.setStreamNode(command.node);
                            break;
                        default:
                            this.executionStateHelper.setStreamMessage(`received unknown debug command ${command.type}`);
                            break;
                    }
                }
            }
            const cleanupFn = await nodeExecutor.execute(dry);
            this.executionStateHelper.removeRunningNode(this.currentNode.uuid);
            this.executionStateHelper.updateNodeResult(nodeResult);
            if (typeof cleanupFn === "function") {
                this.cleanupFns.unshift(cleanupFn);
            }
            this.executionStack.push({ node: this.currentNode, log: nodeResult });
            const nextNodeUUID = nodeResult.failed ? this.currentNode.onFail : this.currentNode.onSuccess;
            this.currentNode = this.executionPackage.design.nodes.find(n => n.uuid === nextNodeUUID);
        }
        await this.cleanup();
        this.streamResult.failed = this.streamResult.nodeResults?.[this.streamResult.nodeResults.length - 1]?.failed ?? false;
        this.streamResult.endTimestamp = Date.now();
        if (this.streamResult.failed) {
            this.executionStateHelper.updateStateAndOutcome({
                state: execution_1.High5ExecutionState.COMPLETED,
                outcome: execution_1.High5ExecutionOutcome.FAILED,
            });
        }
        return this.streamResult.lean();
    }
    setStreamNode(node) {
        const idx = this.executionPackage.design.nodes.findIndex(n => n.uuid === node.uuid);
        if (idx === -1) {
            throw new Error("can only replace node by node with same UUID");
        }
        this.executionPackage.design.nodes[idx] = node;
    }
    removeNodeResult(uuid) {
        const idx = this.streamResult.nodeResults.findIndex(nr => nr.uuid === uuid);
        if (idx !== -1) {
            this.streamResult.nodeResults.splice(idx, 1);
        }
    }
    setNodeResultValue(uuid, key, value) {
        const nodeResult = this.streamResult.nodeResults.find(nr => nr.uuid === uuid);
        if (!nodeResult) {
            return;
        }
        const firstDotIdx = key.indexOf(".");
        if (firstDotIdx === -1) {
            return;
        }
        const type = key.slice(0, firstDotIdx);
        const name = key.slice(firstDotIdx + 1);
        let coll;
        switch (type.toUpperCase()) {
            case "INPUT":
                {
                    if (nodeResult.inputs === undefined) {
                        const spec = nodeResult.executableNode.getNodeSpecification();
                        if (((0, high5_1.isStreamNodeSpecificationV1)(spec) || (0, high5_1.isStreamNodeSpecificationV2)(spec)) &&
                            spec.inputs !== undefined &&
                            spec.inputs.some(i => i.name === name)) {
                            nodeResult.inputs = [
                                {
                                    name,
                                    value: undefined,
                                    originalValue: undefined,
                                    error: false,
                                    errorMessage: "",
                                    type: spec.inputs.find(i => i.name === name).type,
                                },
                            ];
                        }
                    }
                }
                coll = nodeResult.inputs;
                break;
            case "OUTPUT":
                {
                    if (nodeResult.outputs === undefined) {
                        const spec = nodeResult.executableNode.getNodeSpecification();
                        if (((0, high5_1.isStreamNodeSpecificationV1)(spec) || (0, high5_1.isStreamNodeSpecificationV2)(spec)) &&
                            spec.outputs !== undefined &&
                            spec.outputs.some(i => i.name === name)) {
                            nodeResult.outputs = [
                                {
                                    name,
                                    value: undefined,
                                    type: spec.outputs.find(i => i.name === name).type,
                                },
                            ];
                        }
                    }
                }
                coll = nodeResult.outputs;
                break;
            default:
                return;
        }
        const elem = coll.find(e => e.name === name);
        if (elem) {
            elem.value = value;
            this.executionStateHelper.updateNodeResult(nodeResult);
        }
    }
    async cleanup() {
        for (const fn of this.cleanupFns) {
            try {
                await fn();
            }
            catch (ignored) {
            }
        }
    }
}
exports.default = StreamRunner;
var DebugState;
(function (DebugState) {
    DebugState[DebugState["NEXT"] = 0] = "NEXT";
    DebugState[DebugState["CONTINUE"] = 1] = "CONTINUE";
    DebugState[DebugState["STEP"] = 2] = "STEP";
})(DebugState || (DebugState = {}));
