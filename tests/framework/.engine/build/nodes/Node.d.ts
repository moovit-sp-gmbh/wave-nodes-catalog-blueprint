import HCloud from "hcloud-sdk";
import { ExtendedHigh5ExecutionPackage } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import { StreamNodeSpecification, StreamNodeSpecificationOutputType } from "hcloud-sdk/lib/interfaces/high5/wave";
import ExecutionStateHelper from "../helpers/ExecutionStateHelper";
import Wave from "../helpers/Wave";
import { StreamNodeAdditionalConnector, StreamNodeInput, StreamNodeOutput, StreamNodeResolvedInput } from "../models/StreamNode";
import { StreamResult } from "../models/StreamResult";
import StreamRunner from "../utils/StreamRunner";
import WildcardResolver from "../utils/WildcardResolver";
/**
 * The abstract representation of a node that can be executed
 */
export default abstract class Node {
    protected abstract specification: StreamNodeSpecification;
    protected executionPackage: ExtendedHigh5ExecutionPackage;
    protected streamResult: StreamResult;
    private wildcardResolver;
    protected inputs: StreamNodeInput[];
    protected outputs: StreamNodeOutput[];
    additionalConnectors?: StreamNodeAdditionalConnector[];
    protected executionStateHelper: ExecutionStateHelper;
    protected nodeUuid: string;
    protected wave: Wave;
    /**
     *
     * @param executionPackage object holding necessary information for stream execution like the payload, options etc.
     * @param streamResult StreamResult holds all the results of previous executed nodes (required for the WildcardResolver to resolve outputs)
     * @param inputs All given inputs for this node
     * @param additionalConnectors List of connected additionalConnectors with it's targets
     */
    constructor(executionPackage: ExtendedHigh5ExecutionPackage, streamResult: StreamResult, inputs?: StreamNodeInput[], additionalConnectors?: StreamNodeAdditionalConnector[]);
    /**
     * The function prepares the node by setting original values, resolving inputs, preparing outputs,
     * and initializing a wave.
     * @param {ExecutionStateHelper} executionStateHelper - The `executionStateHelper` is meant to be used to playback the
     * overall execution log and status of a stream.
     * @param {string} nodeUuid - Unique identifier for the node
     */
    prepare(executionStateHelper: ExecutionStateHelper, nodeUuid: string, runner: StreamRunner): void;
    /**
     * Public wave helper setter to make unit tests easier
     */
    setWave(wave: Wave): void;
    /**
     * Public executionState helper setter to make unit tests easier
     */
    setExecutionStateHelper(executionStateHelper: ExecutionStateHelper): void;
    /**
     * The function runs a series of input validations, executes a task, and handles any errors that
     * occur.
     */
    run(): Promise<void>;
    cleanup(): Promise<void>;
    /**
     * Abstract execute method implements by each node (actual logic)
     */
    protected abstract execute(): Promise<void>;
    /**
     * Cleanup method that can be implemented by a node to run code after every other node has executed. This method can be set during the execute method.
     */
    onCleanup?(): Promise<void>;
    /**
     * Apply the node specification to the outputs
     */
    private prepareOutputs;
    /**
     * Copies .value to .originalValue to keep unresolved (original) values in nodeResult. .value will
     * be resolved through the WildcardResolver and will be used for the actual execution.
     */
    private setOriginalValues;
    /**
     * validate all inputs & compares all inputs to the nodes specification - incl the types
     */
    private validateInputMandatories;
    /**
     * throws for invalid missing input
     */
    private throwForMissingInputs;
    /**
     * Resolves all inputs through the WildcardReplacer and writes result to .value
     */
    private resolveInputs;
    /**
     * Validates if all input types are correct
     */
    private validateInputTypes;
    /**
     * The function `getInputs` returns an array of input objects of the node in a resolved state, so
     * value as well as originalValue are set.
     * @returns returns an array of `StreamNodeResolvedInput` objects or `undefined` if no inputs are present
     */
    getInputs(): StreamNodeResolvedInput[] | undefined;
    /**
     * The function returns an array of output objects or undefined if no output is set.
     * @returns The method is returning an array of `StreamNodeOutput` objects or `undefined`.
     */
    getOutputs(): StreamNodeOutput[] | undefined;
    /**
     * The function adds an output with a given name and value to the array of outputs.
     * @param {string} name - Name of the output.
     * @param {any} value - Value to be set
     * @returns returns true if the output was added successfully, false if it was already present
     */
    addOutput(name: string, value: any, type?: StreamNodeSpecificationOutputType): boolean;
    /**
     * The function updates an outputs value by name or adds it if not found.
     * @param {string} name - Name of the output.
     * @param {any} value - Value to be set
     */
    setOutput(name: string, value: any, type?: StreamNodeSpecificationOutputType): void;
    /**
     * The function `getNodeSpecification` returns the specification of a node.
     * @returns The method is returning an object of type StreamNodeSpecification.
     */
    getNodeSpecification(): StreamNodeSpecification;
    /**
     * The function `getNodeUuid` returns the UUID of a node.
     * @returns The method returns the UUID of the node
     */
    getNodeUuid(): string;
    /**
     * The getExecutionStateHelper function returns the ExecutionStateHelper object. The `executionStateHelper` is meant to be used to playback the
     * overall execution log and status of a stream.
     * @returns The executionStateHelper object
     */
    getExecutionStateHelper(): ExecutionStateHelper;
    /**
     * The function returns the wildcard resolver to allow wildcard resolving on demand within the node
     * @returns The WildcardResolver.
     */
    getWildcardResolver(): WildcardResolver;
    getStreamResult(): StreamResult;
    /**
     * The function `cancelExecution` sets the execution state to canceled.
     * No new updates of progress message or any other states will then be accepted.
     */
    cancelExecution(): void;
    /**
     * The function `getHcloudClient` returns the hcl instance of the initial execution request.
     * It already holds the server configuration and the users token.
     * @returns HCloud instance
     */
    getHcloudClient(): HCloud;
    /**
     * The function `getOrgName` returns the name of the organization of the initial execution request.
     * @returns Name of the organization
     */
    getOrgName(): string;
    /**
     * The function `getSpaceName` returns the name of the space of the initial execution request.
     * @returns Name of the High5 space
     */
    getSpaceName(): string;
}
