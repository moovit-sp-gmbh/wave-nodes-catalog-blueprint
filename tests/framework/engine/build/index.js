"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
const ExecutionStateHelper_1 = __importDefault(require("./helpers/ExecutionStateHelper"));
const StreamRunner_1 = __importDefault(require("./utils/StreamRunner"));
process.on("uncaughtException", () => {});
process.on("unhandledRejection", () => {});
class Engine extends StreamRunner_1.default {
    constructor(executionPackage, _, catalogPath, agentInfo) {
        super(executionPackage, undefined, catalogPath, agentInfo);
        this.executionStateHelper = new ExecutionStateHelper_1.default().init(executionPackage, this.agentInfo);
    }
    getStatusAndLogs() {
        return this.executionStateHelper.getStatusAndLogs();
    }
    cancelExecution() {
        this.executionStateHelper.cancelExecution();
    }
    async dry() {
        return this.process(true, this.executionStateHelper);
    }
    async run() {
        return this.process(false, this.executionStateHelper);
    }
    async runDev(...incomingWaveNodeFolder) {
        return this.process(false, this.executionStateHelper, undefined, undefined, incomingWaveNodeFolder);
    }
}
exports.default = Engine;
