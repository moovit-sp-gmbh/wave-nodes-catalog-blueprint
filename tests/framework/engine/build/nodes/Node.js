"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wave_1 = require("hcloud-sdk/lib/interfaces/high5/wave");
const StreamNodeErrors_1 = require("../errors/StreamNodeErrors");
const UnknownStreamNodeSpecificationVersion_1 = __importDefault(require("../errors/UnknownStreamNodeSpecificationVersion"));
const Wave_1 = __importDefault(require("../helpers/Wave"));
const WildcardResolver_1 = __importDefault(require("../utils/WildcardResolver"));
class Node {
    executionPackage;
    streamResult;
    wildcardResolver;
    inputs = [];
    outputs = [];
    additionalConnectors;
    executionStateHelper;
    nodeUuid;
    wave;
    constructor(executionPackage, streamResult, inputs, additionalConnectors) {
        this.executionPackage = executionPackage;
        this.streamResult = streamResult;
        inputs?.forEach((i) => this.inputs.push(i));
        this.additionalConnectors = additionalConnectors;
        this.wildcardResolver = new WildcardResolver_1.default(streamResult);
    }
    prepare(nodeUuid, runner) {
        this.executionStateHelper = runner.executionStateHelper;
        this.setOriginalValues();
        this.prepareOutputs();
        this.nodeUuid = nodeUuid;
        this.wave = new Wave_1.default(this, runner);
        this.resolveInputs();
    }
    setWave(wave) {
        this.wave = wave;
    }
    setExecutionStateHelper(executionStateHelper) {
        this.executionStateHelper = executionStateHelper;
    }
    async run() {
        this.validateInputMandatories();
        this.validateInputTypes();
        try {
            await this.execute();
        }
        catch (err) {
            if (!(err instanceof StreamNodeErrors_1.StreamNodeError)) {
                throw new StreamNodeErrors_1.StreamNodeGenericError(err);
            }
            throw err;
        }
    }
    async cleanup() {
        await this.onCleanup?.().catch(err => {
            this.wave.logger.updateMessage(`Failed to cleanup. Cause: ${String(err)}`);
        });
    }
    prepareOutputs() {
        const spec = this.getNodeSpecification();
        if ((0, wave_1.isStreamNodeSpecificationV1)(spec) || (0, wave_1.isStreamNodeSpecificationV2)(spec) || (0, wave_1.isStreamNodeSpecificationV3)(spec)) {
            spec.outputs?.forEach((o) => {
                this.outputs.push({ name: o.name, value: undefined, type: o.type });
            });
        }
        else {
            throw new UnknownStreamNodeSpecificationVersion_1.default(spec.specVersion);
        }
    }
    setOriginalValues() {
        this.inputs?.forEach((i) => {
            if (!i.originalValue) {
                if (typeof i.value === "object") {
                    i.originalValue = JSON.parse(JSON.stringify(i.value));
                }
                else {
                    i.originalValue = i.value;
                }
            }
            const spec = this.getNodeSpecification();
            if ((0, wave_1.isStreamNodeSpecificationV1)(spec) || (0, wave_1.isStreamNodeSpecificationV2)(spec) || (0, wave_1.isStreamNodeSpecificationV3)(spec)) {
                const type = spec.inputs?.find((input) => input.name === i.name)?.type;
                if (type) {
                    i.type = type;
                }
                else {
                    i.type = wave_1.StreamNodeSpecificationInputType.ANY;
                }
            }
        });
    }
    validateInputMandatories() {
        const spec = this.getNodeSpecification();
        if ((0, wave_1.isStreamNodeSpecificationV1)(spec) || (0, wave_1.isStreamNodeSpecificationV2)(spec) || (0, wave_1.isStreamNodeSpecificationV3)(spec)) {
            spec.inputs?.forEach((i) => {
                const input = this.inputs?.find((input) => input.name === i.name);
                this.throwForMissingInputs(input, i);
            });
        }
        else {
            throw new UnknownStreamNodeSpecificationVersion_1.default(spec.specVersion);
        }
    }
    throwForMissingInputs(input, i) {
        if (i.mandatory && !input?.value) {
            throw new StreamNodeErrors_1.StreamNodeInputMissingError(i.name);
        }
    }
    resolveInputs() {
        this.inputs?.map((input) => {
            if (typeof input.originalValue === "string") {
                try {
                    input.value = this.wildcardResolver.resolve(input.originalValue);
                }
                catch (err) {
                    input.error = true;
                    input.errorMessage = err.message;
                }
            }
            else if (typeof input.originalValue === "object" && Array.isArray(input.originalValue)) {
                input.originalValue.forEach((i, index) => {
                    if (typeof i === "string") {
                        try {
                            input.value[index] = this.wildcardResolver.resolve(i);
                        }
                        catch (err) {
                            input.error = true;
                            input.errorMessage = err.message;
                        }
                    }
                    else if (typeof i === "object") {
                        const mapIndex = input.value.findIndex((o) => o.key === i.key);
                        if (mapIndex > -1) {
                            input.value[mapIndex].value = this.wildcardResolver.resolve(i.value);
                            input.value[mapIndex].key = this.wildcardResolver.resolve(i.key);
                        }
                    }
                });
            }
            else if (typeof input.originalValue === "object") {
                input.value = this.wildcardResolver.resolve(input.originalValue.value);
            }
        });
    }
    validateInputTypes() {
        const spec = this.getNodeSpecification();
        if ((0, wave_1.isStreamNodeSpecificationV1)(spec) || (0, wave_1.isStreamNodeSpecificationV2)(spec) || (0, wave_1.isStreamNodeSpecificationV3)(spec)) {
            spec.inputs?.forEach((i) => {
                const input = this.inputs?.find((input) => input.name === i.name);
                if (!i.mandatory && input?.value === undefined) {
                    return;
                }
                if (input) {
                    switch (i.type) {
                        case wave_1.StreamNodeSpecificationInputType.STRING:
                        case wave_1.StreamNodeSpecificationInputType.STRING_LONG:
                        case wave_1.StreamNodeSpecificationInputType.STRING_PASSWORD:
                        case wave_1.StreamNodeSpecificationInputType.STRING_SELECT:
                        case wave_1.StreamNodeSpecificationInputType.STRING_READONLY:
                            if (typeof input.value === "number") {
                                input.value = input.value.toString();
                            }
                            if (typeof input.value !== "string") {
                                throw new StreamNodeErrors_1.StreamNodeInputTypeError(i.name, "string", typeof input.value);
                            }
                            break;
                        case wave_1.StreamNodeSpecificationInputType.NUMBER:
                            if (typeof input.value !== "number") {
                                const n = Number(input.value);
                                if (!isNaN(n)) {
                                    input.value = n;
                                }
                                else {
                                    throw new StreamNodeErrors_1.StreamNodeInputTypeError(i.name, "number", typeof input.value);
                                }
                            }
                            break;
                        case wave_1.StreamNodeSpecificationInputType.BOOLEAN:
                            if (typeof input.value !== "boolean") {
                                if (input.value === "true") {
                                    input.value = true;
                                }
                                else if (input.value === "false") {
                                    input.value = false;
                                }
                                else {
                                    throw new StreamNodeErrors_1.StreamNodeInputTypeError(i.name, "boolean", typeof input.value);
                                }
                            }
                            break;
                        case wave_1.StreamNodeSpecificationInputType.STRING_MAP:
                            if (typeof input.value !== "object") {
                                throw new StreamNodeErrors_1.StreamNodeInputTypeError(i.name, "Record<string, string>", typeof input.value);
                            }
                            else {
                                if (Array.isArray(input.value)) {
                                    if (input.value.every(o => typeof o.key === "string" && typeof o.value === "string")) {
                                        input.value = input.value.reduce((acc, o) => {
                                            acc[o.key] = o.value;
                                            return acc;
                                        }, {});
                                    }
                                    else {
                                        throw new StreamNodeErrors_1.StreamNodeInputTypeError(i.name, "Record<string, string>", typeof input.value);
                                    }
                                }
                                else {
                                    if (Object.values(input.value).some(v => typeof v !== "string")) {
                                        throw new StreamNodeErrors_1.StreamNodeInputTypeError(i.name, "Record<string, string>", typeof input.value);
                                    }
                                }
                            }
                            break;
                        case wave_1.StreamNodeSpecificationInputType.STRING_LIST:
                            if (typeof input.value !== "object" || !Array.isArray(input.value)) {
                                throw new StreamNodeErrors_1.StreamNodeInputTypeError(i.name, "string[]", typeof input.value);
                            }
                            else {
                                const invalidEntry = input.value.find((i) => typeof i !== "string");
                                if (invalidEntry) {
                                    throw new StreamNodeErrors_1.StreamNodeInputTypeError(i.name, "string[]", typeof invalidEntry);
                                }
                            }
                            break;
                        case wave_1.StreamNodeSpecificationInputType.ANY:
                            break;
                        default:
                            break;
                    }
                }
            });
        }
        else {
            throw new UnknownStreamNodeSpecificationVersion_1.default(spec.specVersion);
        }
    }
    getInputs() {
        return this.inputs?.map((i) => {
            return {
                name: i.name,
                originalValue: i.originalValue || i.value,
                value: i.value,
                type: i.type,
                error: i.error,
                errorMessage: i.errorMessage,
            };
        });
    }
    getOutputs() {
        return this.outputs;
    }
    addOutput(name, value, type) {
        this.outputs = this.outputs ?? [];
        const output = this.outputs.find((output) => output.name?.toUpperCase() === name.toUpperCase());
        if (output) {
            return false;
        }
        if (type) {
            this.outputs.push({ name, value, type });
        }
        else {
            this.outputs.push({ name, value });
        }
        return false;
    }
    setOutput(name, value, type) {
        this.outputs = this.outputs ?? [];
        const output = this.outputs.find((output) => output.name?.toUpperCase() === name.toUpperCase());
        if (!output) {
            this.addOutput(name, value, type);
        }
        else {
            output.value = value;
            if (type) {
                output.type = type;
            }
        }
    }
    getNodeSpecification() {
        return this.specification;
    }
    getNodeUuid() {
        return this.nodeUuid;
    }
    getExecutionStateHelper() {
        return this.executionStateHelper;
    }
    getWildcardResolver() {
        return this.wildcardResolver;
    }
    getStreamResult() {
        return this.streamResult;
    }
    cancelExecution() {
        this.executionStateHelper.cancelExecution();
    }
    getHcloudClient() {
        return this.executionPackage.hcl;
    }
    getOrgName() {
        return this.executionPackage.orgName;
    }
    getSpaceName() {
        return this.executionPackage.spaceName;
    }
}
exports.default = Node;
