"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
const high5_1 = require("hcloud-sdk/lib/interfaces/high5");
const StreamCancelledError_1 = __importDefault(require("../errors/StreamCancelledError"));
class DebugClient {
    res;
    rej;
    __promise;
    wait(timeout) {
        if (this.__promise !== undefined) {
            throw new Error("already waiting for command");
        }
        const p = new Promise((res, rej) => {
            this.res = (c) => {
                this.__promise = undefined;
                res(c);
            };
            this.rej = (e) => {
                this.__promise = undefined;
                rej(e);
            };
            const id = setTimeout(() => {
                clearTimeout(id);
                this.rej(new Error("timed out waiting for debug command"));
            }, timeout);
        });
        return (this.__promise = p);
    }
    continue() {
        this.res({
            type: high5_1.CommandType.CONTINUE,
        });
    }
    stepForward() {
        this.res({
            type: high5_1.CommandType.STEP_FORWARD,
        });
    }
    stepBack() {
        this.res({
            type: high5_1.CommandType.STEP_BACK,
        });
    }
    setValue(uuid, key, value) {
        this.res({
            type: high5_1.CommandType.SET_VALUE,
            uuid,
            key,
            value,
        });
    }
    replaceNode(node) {
        this.res({
            type: high5_1.CommandType.REPLACE_NODE,
            node,
        });
    }
    restart() {
        this.res({
            type: high5_1.CommandType.RESTART,
        });
    }
    cancel() {
        this.rej(new StreamCancelledError_1.default());
    }
}
exports.default = DebugClient;
