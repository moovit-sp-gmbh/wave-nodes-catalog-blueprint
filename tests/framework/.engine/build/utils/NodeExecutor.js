"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const high5_1 = require("hcloud-sdk/lib/interfaces/high5");
const uuid_1 = require("uuid");
const StreamNodeErrors_1 = require("../errors/StreamNodeErrors");
const StreamSingleNodeResult_1 = require("../models/StreamSingleNodeResult");
const NodeImport_1 = require("./NodeImport");
class NodeExecutor {
    nodeUuid;
    executionPackage;
    streamResult;
    constructor(nodeUuid, executionPackage, streamResult) {
        this.nodeUuid = nodeUuid;
        this.executionPackage = executionPackage;
        this.streamResult = streamResult;
    }
    async process(dry, executionStateHelper, runner, isAdditionalConnector, catalogPath, extraCatalogLocations) {
        const nodeResult = StreamSingleNodeResult_1.StreamSingleNodeResult.create({
            uuid: (0, uuid_1.v4)(),
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
                nodeResult.streamNode.catalog.name = node[NodeImport_1.NODE_CATALOG_NAME];
                let n;
                try {
                    n = new node(this.executionPackage, this.streamResult, nextNode.inputs, nextNode.additionalConnectors);
                }
                catch (error) {
                    n = new node.default(this.executionPackage, this.streamResult, nextNode.inputs, nextNode.additionalConnectors);
                }
                try {
                    n.prepare(executionStateHelper, this.nodeUuid, runner);
                    nodeResult.inputs = n.getInputs();
                    nodeResult.outputs = n.getOutputs();
                    if (nodeResult.inputs && nodeResult.inputs.find((input) => input.error)) {
                        const errors = nodeResult.inputs.filter((input) => input.error).map((input) => input.errorMessage);
                        throw new StreamNodeErrors_1.StreamWildcardReplacerError(new Error("Failed to resolve wildcard(s)"), JSON.stringify(errors));
                    }
                    const nodeSpec = n.getNodeSpecification();
                    if ((0, high5_1.isStreamNodeSpecificationV1)(nodeSpec) || (0, high5_1.isStreamNodeSpecificationV2)(nodeSpec)) {
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
}
exports.default = NodeExecutor;
