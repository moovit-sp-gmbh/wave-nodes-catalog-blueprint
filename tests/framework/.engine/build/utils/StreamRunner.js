"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
const execution_1 = require("hcloud-sdk/lib/interfaces/high5/space/execution");
const os_1 = __importDefault(require("os"));
const uuid_1 = require("uuid");
const StreamResult_1 = require("../models/StreamResult");
const NodeExecutor_1 = __importDefault(require("./NodeExecutor"));
class StreamRunner {
    agentInfo;
    executionPackage;
    streamResult;
    executionStateHelper;
    extraCatalogLocations;
    catalogPath;
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
                    uuid: (0, uuid_1.v4)(),
                    failed: false,
                    nodeResults: [],
                    startTimestamp: Date.now(),
                    runner: this,
                });
    }
    async process(dry, executionStateHelper, nextNodeUUID, isAdditionalConnector, extraCatalogLocations) {
        nextNodeUUID = nextNodeUUID ?? this.executionPackage.design.startNode;
        this.streamResult.dry = dry;
        this.streamResult.startTimestamp = Date.now();
        this.executionStateHelper = executionStateHelper;
        if (extraCatalogLocations) {
            this.extraCatalogLocations = extraCatalogLocations;
        }
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
}
exports.default = StreamRunner;
