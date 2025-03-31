"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamResult = void 0;
class StreamResult {
    payload;
    uuid;
    startTimestamp;
    endTimestamp;
    host;
    failed;
    dry;
    nodeResults;
    streamVariables;
    runner;
    get info() {
        return {
            startDate: this.startTimestamp,
            endDate: this.endTimestamp,
            runTime: this.endTimestamp ? this.endTimestamp - this.startTimestamp : Date.now() - this.startTimestamp,
            webhook: this.runner.executionPackage.info?.webhook?.callbackUrl
                ? {
                    callbackUrl: this.runner.executionPackage.info?.webhook?.callbackUrl,
                }
                : undefined,
            target: this.runner.executionPackage.info?.target,
        };
    }
    static create(obj) {
        return Object.setPrototypeOf(obj, StreamResult.prototype);
    }
    lean() {
        return {
            host: "",
            endTimestamp: this.endTimestamp,
            failed: this.failed,
            nodeResults: this.nodeResults.map(n => n.lean()),
        };
    }
}
exports.StreamResult = StreamResult;
