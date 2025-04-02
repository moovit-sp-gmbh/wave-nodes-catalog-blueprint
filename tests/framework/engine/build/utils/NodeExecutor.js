"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const high5_1 = require("hcloud-sdk/lib/interfaces/high5");
const StreamNodeErrors_1 = require("../errors/StreamNodeErrors");
const StreamSingleNodeResult_1 = require("../models/StreamSingleNodeResult");
const NodeImport_1 = require("./NodeImport");
class NodeExecutor {
    nodeUuid;
    executionPackage;
    streamResult;
    static DEBUG_TIMEOUT = 10 * 60 * 1000;
    result;
    node;
    runner;
    executableNode;
    constructor(nodeUuid, executionPackage, streamResult) {
        this.nodeUuid = nodeUuid;
        this.executionPackage = executionPackage;
        this.streamResult = streamResult;
    }
    async process(dry, executionStateHelper, runner, isAdditionalConnector, catalogPath, extraCatalogLocations) {
        const nodeResult = StreamSingleNodeResult_1.StreamSingleNodeResult.create({
            uuid: (0, crypto_1.randomUUID)(),
            nodeUuid: this.nodeUuid,
            name: "",
            failed: false,
            startTimestamp: Date.now(),
        });
        let nextNode;
        let cleanupFn = undefined;
        try {
            nextNode = this.findNodeInNodeList(this.nodeUuid);
            nodeResult.streamNode = nextNode;
            nodeResult.name = nextNode.name;
            this.streamResult.nodeResults.push(nodeResult);
            if (!nextNode.bypass) {
                const node = await (0, NodeImport_1.requireNodeByPath)(nextNode, catalogPath, isAdditionalConnector, extraCatalogLocations, this.executionPackage.hcl.getAuthToken());
                if (nodeResult.streamNode.catalog !== undefined && nodeResult.streamNode.catalog !== null) {
                    nodeResult.streamNode.catalog.name = node[NodeImport_1.NODE_CATALOG_NAME];
                }
                let n;
                try {
                    n = new node(this.executionPackage, this.streamResult, nextNode.inputs, nextNode.additionalConnectors);
                }
                catch (error) {
                    n = new node.default(this.executionPackage, this.streamResult, nextNode.inputs, nextNode.additionalConnectors);
                }
                try {
                    n.prepare(this.nodeUuid, runner);
                    nodeResult.inputs = n.getInputs();
                    nodeResult.outputs = n.getOutputs();
                    if (nodeResult.inputs) {
                        const errorIndex = nodeResult.inputs.findIndex(input => input.error);
                        if (errorIndex !== -1) {
                            throw new StreamNodeErrors_1.StreamWildcardReplacerError(new Error("Node preparation failed"), nodeResult.inputs[errorIndex].errorMessage);
                        }
                    }
                    const nodeSpec = n.getNodeSpecification();
                    if ((0, high5_1.isStreamNodeSpecificationV1)(nodeSpec) || (0, high5_1.isStreamNodeSpecificationV2)(nodeSpec) || (0, high5_1.isStreamNodeSpecificationV3)(nodeSpec)) {
                        executionStateHelper.addRunningNode({
                            uuid: this.nodeUuid,
                            name: nodeSpec.name,
                            progress: 0,
                            message: "",
                        });
                    }
                    else {
                        throw new Error(`Unrecognized node specification version ${nodeSpec.specVersion}`);
                    }
                    executionStateHelper.updateNodeResult(nodeResult);
                    if (!dry) {
                        await n.run();
                        nodeResult.outputs = n.getOutputs();
                    }
                }
                catch (err) {
                    nodeResult.failed = true;
                    if (err instanceof StreamNodeErrors_1.StreamNodeError) {
                        nodeResult.error = err.toJson();
                    }
                    else {
                        nodeResult.error = new StreamNodeErrors_1.StreamNodeGenericError(err).toJson();
                    }
                }
                finally {
                    executionStateHelper.removeRunningNode(this.nodeUuid);
                    cleanupFn = n?.cleanup?.bind(n);
                }
            }
            else {
                nodeResult.bypassed = nextNode.bypass;
                executionStateHelper.updateNodeResult(nodeResult);
            }
        }
        catch (err) {
            nodeResult.failed = true;
            if (err instanceof StreamNodeErrors_1.StreamNodeError) {
                nodeResult.error = err.toJson();
            }
            else {
                nodeResult.error = new StreamNodeErrors_1.StreamNodeGenericError(err).toJson();
            }
        }
        nodeResult.endTimestamp = Date.now();
        nodeResult.duration = nodeResult.endTimestamp - nodeResult.startTimestamp;
        return {
            nodeResult: nodeResult,
            node: nextNode,
            cleanupFn,
        };
    }
    findNodeInNodeList(uuid) {
        const streamNode = this.executionPackage.design.nodes.find((n) => n.uuid === uuid);
        if (!streamNode) {
            throw new StreamNodeErrors_1.StreamNodeNotFoundError(uuid);
        }
        return streamNode;
    }
    static create(node, runner, result) {
        const exec = new NodeExecutor(node.uuid, runner.executionPackage, runner.streamResult);
        exec.runner = runner;
        exec.node = node;
        exec.result = result;
        return exec;
    }
    async prepare(catalogPath, extraCatalogLocations, isAdditionalConnector = false) {
        const node = await (0, NodeImport_1.requireNodeByPath)(this.node, catalogPath, isAdditionalConnector, extraCatalogLocations, this.executionPackage.hcl.getAuthToken());
        if (this.result.streamNode.catalog !== undefined && this.result.streamNode.catalog !== null) {
            this.result.streamNode.catalog.name = node[NodeImport_1.NODE_CATALOG_NAME];
        }
        let n;
        try {
            n = new node(this.executionPackage, this.streamResult, this.node.inputs, this.node.additionalConnectors);
        }
        catch (error) {
            n = new node.default(this.executionPackage, this.streamResult, this.node.inputs, this.node.additionalConnectors);
        }
        try {
            n.prepare(this.nodeUuid, this.runner);
            this.result.inputs = n.getInputs();
            this.result.outputs = n.getOutputs();
            if (this.result.inputs && this.result.inputs.find((input) => input.error)) {
                const errors = this.result.inputs.filter((input) => input.error).map((input) => input.errorMessage);
                throw new StreamNodeErrors_1.StreamWildcardReplacerError(new Error("Failed to resolve wildcard(s)"), JSON.stringify(errors));
            }
        }
        catch (err) {
            this.error(err);
        }
        return (this.executableNode = n);
    }
    async execute(dry) {
        if (this.executableNode === undefined) {
            this.error(new Error("node must be prepared before execution"));
            return undefined;
        }
        try {
            if (!dry) {
                await this.executableNode.run();
                this.result.outputs = this.executableNode.getOutputs();
            }
        }
        catch (err) {
            this.error(err);
        }
        finally {
            this.result.endTimestamp = Date.now();
            this.result.duration = this.result.endTimestamp - this.result.startTimestamp;
        }
        return this.executableNode?.cleanup?.bind(this.executableNode);
    }
    error(err) {
        this.result.failed = true;
        if (err instanceof StreamNodeErrors_1.StreamNodeError) {
            this.result.error = err.toJson();
        }
        else {
            this.result.error = new StreamNodeErrors_1.StreamNodeGenericError(err).toJson();
        }
    }
}
exports.default = NodeExecutor;
