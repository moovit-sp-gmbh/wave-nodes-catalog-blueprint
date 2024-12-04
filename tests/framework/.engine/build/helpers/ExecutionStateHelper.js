"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const index_1 = require("hcloud-sdk/lib/interfaces/high5/space/execution/index");
const path_1 = __importDefault(require("path"));
class ExecutionStateHelper {
    streamId;
    streamStatus;
    streamLog;
    executionPackage;
    resetState(isInit) {
        if (isInit) {
            this.streamStatus = {
                streamId: this.streamId,
                state: index_1.High5ExecutionState.RUNNING,
                outcome: index_1.High5ExecutionOutcome.PENDING,
                runningNodes: [],
                message: "",
                startDate: Date.now(),
            };
        }
        else {
            this.streamStatus = {
                streamId: this.streamId,
                runningNodes: [],
                message: "",
                startDate: this.streamStatus?.startDate || Date.now(),
            };
        }
        this.streamLog = {
            streamId: this.streamId,
            nodeResults: [],
        };
    }
    init(executionPackage) {
        this.streamId = executionPackage.streamId;
        this.executionPackage = executionPackage;
        this.resetState(true);
        return this;
    }
    getStatusAndLogs() {
        const state = { status: this.streamStatus, logs: this.streamLog };
        this.resetState(false);
        return state;
    }
    updateStateAndOutcome(statusUpdate) {
        if (statusUpdate.state && this.streamStatus.state !== statusUpdate.state) {
            this.streamStatus.state = statusUpdate.state;
        }
        if (statusUpdate.outcome && this.streamStatus.outcome !== statusUpdate.outcome) {
            this.streamStatus.outcome = statusUpdate.outcome;
        }
        this.streamStatus.endDate = Date.now();
    }
    addRunningNode(node) {
        if (!this.streamStatus.runningNodes) {
            this.streamStatus.runningNodes = [node];
            return;
        }
        if (!this.streamStatus.runningNodes.find((existing) => existing.uuid === node.uuid)) {
            this.streamStatus.runningNodes.push(node);
        }
    }
    removeRunningNode(nodeUuid) {
        if (!this.streamStatus.runningNodes) {
            this.streamStatus.runningNodes = [];
            return;
        }
        this.streamStatus.runningNodes = this.streamStatus.runningNodes.filter((existing) => nodeUuid !== existing.uuid);
    }
    updateProgressAndMessage(runningNodeUpdate, nodeUuid) {
        if (this.streamStatus.state === index_1.High5ExecutionState.COMPLETED) {
            return;
        }
        if (!this.streamStatus.runningNodes) {
            this.streamStatus.runningNodes = [{ uuid: nodeUuid, name: "", progress: runningNodeUpdate.progress || -1, message: runningNodeUpdate.message || "" }];
            return;
        }
        const index = this.streamStatus.runningNodes.findIndex((node) => node.uuid === nodeUuid);
        if (index > -1) {
            if (typeof runningNodeUpdate.progress === "number" &&
                runningNodeUpdate.progress >= -1 &&
                runningNodeUpdate.progress !== this.streamStatus.runningNodes[index].progress) {
                this.streamStatus.runningNodes[index].progress = runningNodeUpdate.progress;
            }
            if (runningNodeUpdate.message && runningNodeUpdate.message !== this.streamStatus.runningNodes[index].message) {
                this.streamStatus.runningNodes[index].message = runningNodeUpdate.message;
            }
        }
    }
    getRunningNode(nodeUuid) {
        if (!this.streamStatus.runningNodes)
            return undefined;
        return this.streamStatus.runningNodes.find((node) => node.uuid === nodeUuid);
    }
    updateNodeResult(nodeResult) {
        if (this.streamStatus.state === index_1.High5ExecutionState.COMPLETED) {
            return;
        }
        const index = this.streamLog.nodeResults.findIndex(node => node.uuid === nodeResult.uuid);
        if (index > -1) {
            this.streamLog.nodeResults[index] = nodeResult.lean();
        }
        else {
            this.streamLog.nodeResults.push(nodeResult.lean());
        }
    }
    setNodeResults(nodeResults) {
        this.streamLog.nodeResults = nodeResults.map(n => n.lean());
    }
    cancelExecution() {
        this.updateStateAndOutcome({ state: index_1.High5ExecutionState.COMPLETED, outcome: index_1.High5ExecutionOutcome.CANCELED });
    }
    getOutcome() {
        return this.streamStatus.outcome;
    }
    setStreamMessage(message) {
        if (message && this.streamStatus.message !== message) {
            this.streamStatus.message = message;
        }
    }
    reportUnhandledError(err) {
        const high5ExecutionResponse = {
            high5ExecutionPatchStatus: {
                streamId: this.streamId,
                state: index_1.High5ExecutionState.COMPLETED,
                outcome: index_1.High5ExecutionOutcome.FAILED,
                message: `An unhandled error occurred: ${String(err)}`,
                endDate: Date.now(),
            },
            high5ExecutionPatchLog: {
                streamId: this.streamId,
                nodeResults: [],
            },
        };
        this.executionPackage.hcl.High5.space.execute
            .high5ExecutionStatusAndLogResponse(this.executionPackage.orgName, this.executionPackage.spaceName, this.executionPackage.secret, high5ExecutionResponse)
            .catch(err => {
            const errorLogPath = path_1.default.join(__dirname, "..", "..", "..", "..", "..", "waveError.log");
            fs_1.default.appendFileSync(errorLogPath, `Failed to report unhandled error for stream '${this.streamId}': ${err}`);
        });
    }
}
exports.default = ExecutionStateHelper;