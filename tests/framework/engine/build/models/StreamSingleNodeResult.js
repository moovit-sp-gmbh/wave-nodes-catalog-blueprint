"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamSingleNodeResult = void 0;
class StreamSingleNodeResult {
    uuid;
    nodeUuid;
    failed;
    startTimestamp;
    endTimestamp;
    name;
    inputs;
    outputs;
    error;
    logs;
    duration;
    bypassed;
    nodeResults;
    waiting;
    streamNode;
    executableNode;
    get info() {
        return {
            runTime: this.endTimestamp ? this.endTimestamp - this.startTimestamp : Date.now() - this.startTimestamp,
            catalog: this.streamNode.catalog,
            color: this.streamNode.color,
            nodeType: this.streamNode.nodeType,
        };
    }
    static create(obj) {
        return Object.setPrototypeOf(obj, StreamSingleNodeResult.prototype);
    }
    lean() {
        return {
            uuid: this.uuid,
            nodeUuid: this.nodeUuid,
            failed: this.failed,
            startTimestamp: this.startTimestamp,
            endTimestamp: this.endTimestamp,
            name: this.name,
            inputs: this.inputs,
            outputs: this.outputs,
            error: this.error,
            logs: this.logs,
            duration: this.duration,
            bypassed: this.bypassed,
            nodeResults: this.nodeResults,
            info: this.info,
            waiting: this.waiting,
        };
    }
}
exports.StreamSingleNodeResult = StreamSingleNodeResult;
