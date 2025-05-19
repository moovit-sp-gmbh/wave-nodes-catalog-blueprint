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
        let trigger;
        if (this.runner.executionPackage.info.triggerDetails) {
            trigger = {
                source: this.runner.executionPackage.info.triggerDetails.source,
                ip: this.runner.executionPackage.info.triggerDetails.ip,
                country: this.runner.executionPackage.info.triggerDetails.country,
            };
        }
        return {
            startDate: this.startTimestamp,
            endDate: this.endTimestamp,
            runTime: this.endTimestamp ? this.endTimestamp - this.startTimestamp : Date.now() - this.startTimestamp,
            webhook: this.runner.executionPackage.info?.webhook?.callbackUrl
                ? {
                      callbackUrl: this.runner.executionPackage.info?.webhook?.callbackUrl,
                  }
                : undefined,
            target: this.runner.executionPackage.targetEmail,
            trigger: trigger,
            uuid: this.runner.executionPackage.executionId,
            waveEngine: this.runner.executionPackage.waveEngine.version,
            isPool: this.runner.executionPackage.poolName ? true : false,
            poolName: this.runner.executionPackage.poolName,
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
            nodeResults: this.nodeResults.map((n) => n.lean()),
        };
    }
}
exports.StreamResult = StreamResult;
