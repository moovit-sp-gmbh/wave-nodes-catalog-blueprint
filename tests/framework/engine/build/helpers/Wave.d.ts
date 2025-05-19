import { AxiosRequestConfig } from "axios";
import HCloud from "hcloud-sdk";
import { StreamResult } from "hcloud-sdk/lib/interfaces/high5";
import {
    StreamNodeSpecification,
    StreamNodeSpecificationInput,
    StreamNodeSpecificationOutputType,
} from "hcloud-sdk/lib/interfaces/high5/wave";
import { DuplicateFileOption } from "../models/DuplicateFileOptionEnum";
import { DuplicateFolderOption } from "../models/DuplicateFolderOptionEnum";
import { StreamNodeOutput, StreamNodeResolvedInput } from "../models/StreamNode";
import Node from "../nodes/Node";
import StreamRunner from "../utils/StreamRunner";
/**
 * The Wave class provides access to the nodes internal methods and properties in a user friendly way.
 */
export default class Wave {
    general: General;
    logger: Logger;
    inputs: Inputs;
    outputs: Outputs;
    fileAndFolderHelper: FileAndFolderHelper;
    axiosHelper: AxiosHelper;
    constructor(node: Node, executor: StreamRunner);
}
/**
 * This class provides access to general node methods and properties.
 */
declare class General {
    private node;
    constructor(node: Node);
    /**
     * Returns the nodes uuid, a unique identifier for the node
     * @returns UUID of the node
     */
    getNodeUuid(): string;
    /**
     * Resolves an arbitrary string value on demand within the node. Keep in mind that any wildcards
     * used in node inputs are already resolved. Use {@link Wave.Inputs.getInputValueByInputName} to
     * get the resolved value of an input.
     * @param value - String to be resolved
     * @returns The resolved value as number if its a string representation of a number, otherwise as string
     * @example
     * this.wave.general.resolveValue("123");  // it returns 123 as a number
     * this.wave.general.resolveValue("{{OUTPUT.<nodeUuid>.res.data}}");  // resolve a wildcard on demand, in this case the output of another node
     */
    resolveValue(value: string): number | string;
    /**
     * Returns the node specification of a stream node.
     * @returns StreamNodeSpecification
     */
    getNodeSpecification(): StreamNodeSpecification;
    /**
     * Sets the overall execution state to "CANCELED". Make sure to stop all
     * processes the node is currently running before calling that method.
     */
    cancelExecution(): void;
    /**
     * Checks if the execution state is "CANCELED".
     * @returns `true` if the execution state is "CANCELED", otherwise `false`
     */
    isCanceled(): boolean;
    /**
     * Returns the HCloud SDK client coming from the initial execution request.
     * It already holds the server configuration and the token of the execution target.
     * @returns The HCloud client
     */
    getHcloudClient(): HCloud;
    /**
     * Returns the name of the organization from the initial execution request.
     * @returns Name of the organization
     */
    getOrgName(): string;
    /**
     * Returns the name of the space from the initial execution request.
     * @returns Name of the High5 space
     */
    getSpaceName(): string;
    /**
     * Updates the streams dashboard message.
     * @param message - New message
     */
    setStreamMessage(message: string): void;
}
/**
 * This class provides methods to update the progress and status message of the node.
 */
declare class Logger {
    private node;
    constructor(node: Node);
    /**
     * Returns the progress value defined in the node's execution status.
     * @returns The current progress value or undefined if not found or set
     */
    getCurrentProgress(): number | undefined;
    /**
     * Returns the currently set status message of the node.
     * @returns The current message or undefined if not found or set
     */
    getCurrentMessage(): string | undefined;
    /**
     * Updates the 'progress' property in the node's execution status.
     * This property is used in the frontend to visually render the node's progress.
     * @param progress - New progress value
     */
    updateProgress(progress: number): void;
    /**
     * Updates the status message of the node.
     * @param {string} message - The new message
     */
    updateMessage(message: string): void;
    /**
     * Updates the progress and status message of the node.
     * @param {number} progress - New progress value
     * @param {string} message - New message
     */
    updateProgressAndMessage(progress: number, message: string): void;
    /**
     * Adds a new entry to the node logs, which are accessible in the Debugger of the Stream Designer Studio after the node has finished executing.
     * These logs are intended for critical and essential information sharing only, please use them sparingly and ensure that log messages are short
     * and concise to optimize readability and system performance.
     *
     */
    addNodeLog(logMessage: string): void;
}
/**
 * This class provides methods to retrieve node inputs and their resolved values.
 */
declare class Inputs {
    private node;
    constructor(node: Node);
    /**
     * Returns all existing input objects.
     * @returns a list of `StreamNodeResolvedInput` objects or an empty list if node has no inputs
     */
    getInputs(): StreamNodeResolvedInput[];
    /**
     * Returns the input object by name.
     * @param inputName - Name of the input
     * @returns a `StreamNodeResolvedInput` object or `undefined` if not found
     */
    getInputByName(inputName: string): StreamNodeResolvedInput | undefined;
    /**
     * Returns the pre-resolved input object by name.
     * @param inputName - Name of the input
     * @returns a `StreamNodeSpecificationInput` object or `undefined` if not found
     */
    getPreresolvedInputByName(inputName: string): StreamNodeSpecificationInput | undefined;
    /**
     * Returns the resolved input value from an input by name.
     * @param inputName - Name of the input
     * @returns the value of the input or `undefined` if not found
     * @example
     * const stringInputValue: string = this.wave.inputs.getInputValueByInputName(Input.NAME_OF_STRING_INPUT);
     * const stringLongInputValue: string = this.wave.inputs.getInputValueByInputName(Input.NAME_OF_STRING_LONG_INPUT);
     * const stringPasswordInputValue: string = this.wave.inputs.getInputValueByInputName(Input.NAME_OF_STRING_PASSWORD_INPUT);
     * const numberInputValue: number = this.wave.inputs.getInputValueByInputName(Input.NAME_OF_NUMBER_INPUT);
     * const booleanInputValue: boolean = this.wave.inputs.getInputValueByInputName(Input.NAME_OF_BOOLEAN_INPUT);
     * const stringSelectInputValue: string = this.wave.inputs.getInputValueByInputName(Input.NAME_OF_STRING_SELECT_INPUT);
     * const stringListInputValue: string[] = this.wave.inputs.getInputValueByInputName(Input.NAME_OF_STRING_LIST_INPUT);
     * const stringMapInputValue: Record<string, string> = this.wave.inputs.getInputValueByInputName(Input.NAME_OF_STRING_MAP_INPUT);
     */
    getInputValueByInputName(inputName: string): any;
    /**
     * Returns the original input value (pre-wildcard resolved) by name.
     * @param inputName - Name of the input
     * @returns the original value of the input or `undefined` if not found
     */
    getInputOriginalValueByInputName(inputName: string): any;
}
/**
 * This class provides methods to get and set node outputs as well as to execute additional connectors.
 */
declare class Outputs {
    node: Node;
    private executor;
    constructor(node: Node, executor: StreamRunner);
    /**
     * Returns all existing output objects.
     * @returns a list of `StreamNodeOutput` objects or an empty list if node has no outputs
     */
    getAllOutputs(): StreamNodeOutput[];
    /**
     * Returns the output object by name.
     * @param outputName - Name of the output
     * @returns a `StreamNodeOutput` object or `undefined` if not found
     */
    getOutputByName(outputName: string): StreamNodeOutput | undefined;
    /**
     * Returns the output value by name.
     * @param outputName - Name of the output
     * @returns the value of the output or `undefined` if not found
     */
    getOutputValueByOutputName(outputName: string): any;
    /**
     * Sets the value of an output. Outputs can be accessed in the Stream Designer Studio and can serve as inputs for other nodes.
     * @param name - Name of the output
     * @param value - Value to be set
     * @param type - (Optional) Override the type of the output originally defined in your node specification.
     */
    setOutput(name: string, value: any, type?: StreamNodeSpecificationOutputType): void;
    /**
     * Executes the node attached to the additional connector and returns the stream result of that node.
     * @param connectorName - Name of the additional connector
     * @returns the stream result or undefined if additional connector wasn't found by name
     */
    executeAdditionalConnector(connectorName: string): Promise<StreamResult | undefined>;
}
type FileFolderReturnObject = {
    finalPath: string;
    srcChecksum?: string;
};
/**
 * This class provides helper methods for file and folder operations.
 */
declare class FileAndFolderHelper {
    node: Node;
    private logger;
    constructor(node: Node);
    /**
     * Creates an empty file.
     * @param filePath File path with file extension. If path contains folders that do not exist yet, they will be created.
     * @param duplicateFileOption Option defining how to handle an already existing file with the same name
     * @returns final path of the created file. If the file already exists and duplicateFileOption = SKIP, the already existing file path will be returned.
     */
    createFile(filePath: string, duplicateFileOption: DuplicateFileOption): Promise<string>;
    /**
     * Creates a folder.
     * @param folderPath Folder path. If path contains parent folders that do not exist yet, they will be created as well.
     * @param duplicateFolderOption Option defining how to handle an already existing folder with the same name
     * @returns final path of the created folder. If the folder already exists and duplicateFolderOption = SKIP, the already existing folder path will be returned.
     */
    createFolder(folderPath: string, duplicateFolderOption: DuplicateFolderOption): Promise<string>;
    /**
     * Copies a file to the specified location.
     * @param srcFilePath Source file path with file extension
     * @param destFilePath Destination file path with file extension. If path contains folders that do not exist yet, they will be created.
     * @param duplicateFileOption Option defining how to handle an already existing file with the same name
     * @param progressCallback (Optional) callback function that will be called whenever the progress increases by 1%, but limited to max 1/s. Can be used to trigger an additional connector.
     * @param getSrcChecksum (Optional) Calculate the MD5 checksum of the source file while copying (this is more efficient than creating the md5 separately).
     * @param abortSignal (Optional) When provided, the method will listen to the "abort" event of the signal and - once triggered - abort the file operation with an error (without any cleanup).
     * @returns An object containing the final file path and the MD5 checksum of the source file or, if getSrcChecksum is undefined, just the final file path as a string.
     */
    copyFile<T extends boolean | undefined = undefined>(
        srcFilePath: string,
        destFilePath: string,
        duplicateFileOption: DuplicateFileOption,
        progressCallback?: (percent: number) => void,
        getSrcChecksum?: T,
        abortSignal?: AbortSignal
    ): Promise<T extends undefined ? string : FileFolderReturnObject>;
    /**
     * Copies a folder to the specified location.
     * @param srcFolderPath Source folder path
     * @param destFolderPath Destination folder path (full path, not parent folder path). If path contains folders that do not exist yet, they will be created.
     * @param duplicateFolderOption Option defining how to handle an already existing folder with the same name
     * @param progressCallback (Optional) callback function that will be called whenever there is measurable progress, but limited to max 1/s. Can be used to trigger an additional connector.
     * @param getSrcChecksum (Optional) Calculate the MD5 checksum of the source folder while copying (this is more efficient than creating the md5 separately).
     * @param abortSignal (Optional) When provided, the method will listen to the "abort" event of the signal and - once triggered - abort the file operation with an error (without any cleanup).
     * @returns An object containing the final folder path and the MD5 checksum of the source folder or, if getSrcChecksum is undefined, just the final folder path as a string.
     */
    copyFolder<T extends boolean | undefined = undefined>(
        srcFolderPath: string,
        destFolderPath: string,
        duplicateFolderOption: DuplicateFolderOption,
        progressCallback?: (percent: number) => void,
        getSrcChecksum?: T,
        abortSignal?: AbortSignal
    ): Promise<T extends undefined ? string : FileFolderReturnObject>;
    /**
     * Moves a file to the specified location.
     * @param srcFilePath Source file path with file extension
     * @param destFilePath Destination file path with file extension. If path contains folders that do not exist yet, they will be created.
     * @param duplicateFileOption Option defining how to handle an already existing file with the same name
     * @param progressCallback (Optional) callback function that will be called whenever the progress increases by 1%, but limited to max 1/s. Can be used to trigger an additional connector.
     * @param getSrcChecksum (Optional) Calculate the MD5 checksum of the source file while copying (this is more efficient than creating the md5 separately).
     * @param abortSignal (Optional) When provided, the method will listen to the "abort" event of the signal and - once triggered - abort the folder operation with an error (without any cleanup).
     * @returns An object containing the final file path and the MD5 checksum of the source file or, if getSrcChecksum is undefined, just the final file path as a string.
     */
    moveFile<T extends boolean | undefined = undefined>(
        srcFilePath: string,
        destFilePath: string,
        duplicateFileOption: DuplicateFileOption,
        progressCallback?: (percent: number) => void,
        getSrcChecksum?: T,
        abortSignal?: AbortSignal
    ): Promise<T extends undefined ? string : FileFolderReturnObject>;
    /**
     * Moves a folder to the specified location.
     * @param srcFolderPath Source folder path
     * @param destFolderPath Destination folder path. If path contains parent folders that do not exist yet, they will be created.
     * @param duplicateFolderOption Option defining how to handle an already existing folder with the same name
     * @param progressCallback (Optional) callback function that will be called whenever there is measurable progress, but limited to max 1/s. Can be used to trigger an additional connector.
     * @param getSrcChecksum (Optional) Calculate the MD5 checksum of the source folder while copying (this is more efficient than creating the md5 separately)
     * @param abortSignal (Optional) When provided, the method will listen to the "abort" event of the signal and - once triggered - abort the folder operation with an error (without any cleanup).
     * @returns An object containing the final folder path and the MD5 checksum of the source folder or, if getSrcChecksum is undefined, just the final folder path as a string.
     */
    moveFolder<T extends boolean | undefined = undefined>(
        srcFolderPath: string,
        destFolderPath: string,
        duplicateFolderOption: DuplicateFolderOption,
        progressCallback?: (percent: number) => void,
        getSrcChecksum?: T,
        abortSignal?: AbortSignal
    ): Promise<T extends undefined ? string : FileFolderReturnObject>;
    /**
     * Renames a file.
     * @param filePath File path with file extension
     * @param newName New name of the file, without file extension
     * @returns final path of the renamed file. If a file with the provided name already exists and duplicateFileOption = SKIP, the source file path will be returned.
     */
    renameFile(filePath: string, newName: string, duplicateFileOption: DuplicateFileOption): Promise<string>;
    /**
     * Renames a folder.
     * @param folderPath Path of the folder to rename
     * @param newName New name of the folder
     * @returns final path of the renamed folder. If a folder with the provided name already exists and duplicateFolderOption = SKIP, the source folder path will be returned.
     */
    renameFolder(folderPath: string, newName: string, duplicateFolderOption: DuplicateFolderOption): Promise<string>;
    /**
     * Deletes a file.
     * @param filePath File path with file extension
     */
    deleteFile(filePath: string): Promise<void>;
    /**
     * Deletes a folder.
     * @param folderPath Folder path
     */
    deleteFolder(folderPath: string): Promise<void>;
    /**
     * Calculates and returns the MD5 checksum of a file.
     * @param filePath Path of the file to generate the md5 hash for
     * @param abortSignal (Optional) When provided, the method will listen to the "abort" event of the signal and - once triggered - abort the operation.
     */
    getFileMd5Hash(filePath: string, signal?: AbortSignal): Promise<string>;
    /**
     * Calculates and returns the MD5 checksum of a folder.
     * @param folderPath Path of the folder to generate the md5 hash for
     * @param abortSignal (Optional) When provided, the method will listen to the "abort" event of the signal and - once triggered - abort the operation.
     */
    getFolderMd5Hash(folderPath: string, signal?: AbortSignal): Promise<string>;
}
/**
 * This class provides helper methods for Axios operations.
 */
export declare class AxiosHelper {
    /**
     * Makes an axios request based on the provided AxiosRequestConfig object and returns
     * the body of the response (response.data). If the HTTP response has a status code
     * outside of range 2xx, a descriptive error (with the error message provided by the
     * requested ressource) will be thrown.
     *
     * Please use this method instead of manually doing http requests if possible, as this
     * way we ensure that error axios errors are handled consistently across hcloud catalogs.
     */
    makeRequest(config: AxiosRequestConfig): Promise<any>;
    /**
     * Converts a AxiosRequestConfig object into a curl command string. Does not support form data! Example output:
     *
     * 'curl -X POST \
      -H "Authorization: Bearer your-api-key-here" \
      -H "Content-Type: application/json" \
      -d '{ "name": "helmut.cloud", "start": "2023-04-15T10:00:00", "end": "2023-04-15T16:00:00" }' \
      https://api.example.com/'
     */
    convertRequestToCurl(config: AxiosRequestConfig): string;
    /**
     * Removes all properties (also nested) from an object that are either undefined, null or
     * empty (empty objects, arrays, strings). This method can be helpful in scenarios where
     * you want to forward user input data - which can be empty or undefined - directly to an
     * API via Axios, which does not strip empty/undefined fields by default.
     */
    removeEmptyFields(obj: Record<string, any>): Record<string, any>;
}
export {};
