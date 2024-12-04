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
    duration;
    bypassed;
    nodeResults;
    streamNode;
    get info() {
        return {
            runTime: this.endTimestamp ? this.endTimestamp - this.startTimestamp : Date.now() - this.startTimestamp,
            catalog: this.streamNode.catalog,
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
            duration: this.duration,
            bypassed: this.bypassed,
            nodeResults: this.nodeResults,
            info: this.info,
        };
    }
}
exports.StreamSingleNodeResult = StreamSingleNodeResult;
