"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JsonPathExtractor_1 = require("../helpers/JsonPathExtractor");
class WildcardResolver {
    streamResult;
    static MAX_WILDCARD_NESTINGS = 100;
    constructor(streamResult) {
        this.streamResult = streamResult;
    }
    resolve(input) {
        const re = /{{([^{}]+?)}}/g;
        let signal = false;
        function interrupt() {
            signal = true;
        }
        for (let nestingCounter = 0; !signal; ++nestingCounter) {
            if (nestingCounter >= WildcardResolver.MAX_WILDCARD_NESTINGS) {
                throw new Error("Exceeded the maximum number of wildcard replacements allowed");
            }
            if (input.indexOf("{{") === -1) {
                break;
            }
            const matches = input.match(re);
            if (matches) {
                for (let i = 0; !signal && i < matches.length; ++i) {
                    const wildcard = re.exec(input)?.[1];
                    if (wildcard) {
                        let result = this.processWildcard(wildcard.trim(), interrupt);
                        if (result === undefined) {
                            throw new Error(`Unable to resolve wildcard: {{${wildcard}}}`);
                        }
                        else {
                            if (typeof result === "object") {
                                result = JSON.stringify(result);
                            }
                            input = input.split(`{{${wildcard}}}`).join(result);
                        }
                    }
                }
            }
            else {
                break;
            }
        }
        return /^-?\d+$/.test(input) ? Number(input) : input;
    }
    processWildcard(wildcard, interrupt) {
        const [type, ...path] = splitWildcard(wildcard);
        switch (type.toUpperCase()) {
            case "AGENT":
                return this.handleAgentWildcard(path);
            case "STREAM":
                return this.handleStreamWildcard(path);
            case "NODE":
                return this.handleNodeWildcard(path, interrupt);
            case "OUTPUT":
                return this.handleOutputWildcard(path);
            case "PAYLOAD":
                return this.handlePayloadWildcard(path);
            case "VARIABLE":
                return this.handleStreamVariableWildcard(path);
            default:
                return undefined;
        }
    }
    handleOutputWildcard(splittedWildcard) {
        const nodeResults = this.streamResult.nodeResults;
        const node = nodeResults.find((node) => node.nodeUuid === splittedWildcard[0]);
        const output = node?.outputs?.find((output) => output.name === splittedWildcard[1]);
        if (splittedWildcard.length < 3) {
            return output?.value;
        }
        return (0, JsonPathExtractor_1.extractFromJSON)(output?.value, splittedWildcard.slice(2));
    }
    handlePayloadWildcard(wildcard) {
        return (0, JsonPathExtractor_1.extractFromJSON)(this.streamResult.payload.data, wildcard);
    }
    handleStreamVariableWildcard(wildcard) {
        const resolvedVariable = this.streamResult.streamVariables ? (0, JsonPathExtractor_1.extractFromJSON)(this.streamResult.streamVariables, wildcard) : undefined;
        if (!resolvedVariable)
            throw new Error(`Stream variable '${wildcard}' does not exist`);
        return resolvedVariable;
    }
    handleNodeWildcard(wildcard, interrupt) {
        const [uuid, type, ...rest] = wildcard;
        const node = this.streamResult.nodeResults.find(n => n.nodeUuid === uuid);
        if (!node) {
            return undefined;
        }
        let value;
        const [name, ...path] = rest;
        switch (type.toUpperCase()) {
            case "INPUT":
                value = node.inputs?.find(i => i.name === name)?.value;
                break;
            case "OUTPUT":
                value = node.outputs?.find(i => i.name === name)?.value;
                break;
            case "ERROR":
                value = node.error;
                if (rest.length > 0) {
                    return (0, JsonPathExtractor_1.extractFromJSON)(value, rest);
                }
                return value;
            case "ERRORS":
                if (node.inputs === undefined) {
                    return [];
                }
                value = [];
                for (const input of node.inputs) {
                    if (input.error) {
                        value.push(input.errorMessage);
                    }
                }
                interrupt();
                if (rest.length > 0) {
                    return (0, JsonPathExtractor_1.extractFromJSON)(value, rest);
                }
                return value;
            case "LOGS":
                value = node.logs;
                if (rest.length > 0) {
                    return (0, JsonPathExtractor_1.extractFromJSON)(value, rest);
                }
                break;
            case "INFO":
                value = node.info;
                if (rest.length > 0) {
                    return (0, JsonPathExtractor_1.extractFromJSON)(value, rest);
                }
                break;
            default:
                return undefined;
        }
        if (path.length === 0) {
            return value;
        }
        return (0, JsonPathExtractor_1.extractFromJSON)(value, path);
    }
    handleStreamWildcard(wildcard) {
        const [type, ...path] = wildcard;
        let value;
        switch (type.toUpperCase()) {
            case "INFO":
                value = this.streamResult.info;
                break;
            default:
                return undefined;
        }
        return (0, JsonPathExtractor_1.extractFromJSON)(value, path);
    }
    handleAgentWildcard(wildcard) {
        const [type, ...path] = wildcard;
        let value;
        switch (type.toUpperCase()) {
            case "INFO":
                value = this.streamResult.runner.agentInfo;
                break;
            default:
                return undefined;
        }
        return (0, JsonPathExtractor_1.extractFromJSON)(value, path);
    }
}
exports.default = WildcardResolver;
const WILDCARD_REGEX = /\.?([^.\[\]]+)((\[.*\])*)?/g;
function splitWildcard(s) {
    WILDCARD_REGEX.lastIndex = 0;
    const keys = [];
    for (let m = WILDCARD_REGEX.exec(s); m !== null; m = WILDCARD_REGEX.exec(s)) {
        if (m.index === WILDCARD_REGEX.lastIndex) {
            WILDCARD_REGEX.lastIndex++;
        }
        if (m[1]) {
            keys.push(m[1]);
        }
        if (m[2]) {
            keys.push(...m[2].slice(1, -1).split("]["));
        }
    }
    return keys;
}
