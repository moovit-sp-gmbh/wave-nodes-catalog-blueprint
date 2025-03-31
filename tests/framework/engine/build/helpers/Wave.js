"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxiosHelper = void 0;
const axios_1 = __importDefault(require("axios"));
const promises_1 = __importDefault(require("fs/promises"));
const execution_1 = require("hcloud-sdk/lib/interfaces/high5/space/execution");
const wave_1 = require("hcloud-sdk/lib/interfaces/high5/wave");
const path_1 = __importDefault(require("path"));
const UnknownStreamNodeSpecificationVersion_1 = __importDefault(require("../errors/UnknownStreamNodeSpecificationVersion"));
const DuplicateFileOptionEnum_1 = require("../models/DuplicateFileOptionEnum");
const DuplicateFolderOptionEnum_1 = require("../models/DuplicateFolderOptionEnum");
const FileAndFolderHelper_1 = require("./FileAndFolderHelper");
class Wave {
    general;
    logger;
    inputs;
    outputs;
    fileAndFolderHelper;
    axiosHelper;
    constructor(node, executor) {
        this.general = new General(node);
        this.logger = new Logger(node);
        this.inputs = new Inputs(node);
        this.outputs = new Outputs(node, executor);
        this.fileAndFolderHelper = new FileAndFolderHelper(node);
        this.axiosHelper = new AxiosHelper();
    }
}
exports.default = Wave;
class General {
    node;
    constructor(node) {
        this.node = node;
    }
    getNodeUuid() {
        return this.node.getNodeUuid();
    }
    resolveValue(value) {
        return this.node.getWildcardResolver().resolve(value);
    }
    getNodeSpecification() {
        return this.node.getNodeSpecification();
    }
    cancelExecution() {
        this.node.cancelExecution();
    }
    isCanceled() {
        const outcome = this.node.getExecutionStateHelper().getOutcome();
        if (outcome && outcome === execution_1.High5ExecutionOutcome.CANCELED) {
            return true;
        }
        return false;
    }
    getHcloudClient() {
        return this.node.getHcloudClient();
    }
    getOrgName() {
        return this.node.getOrgName();
    }
    getSpaceName() {
        return this.node.getSpaceName();
    }
    setStreamMessage(message) {
        this.node.getExecutionStateHelper().setStreamMessage(message);
    }
}
class Logger {
    node;
    constructor(node) {
        this.node = node;
    }
    getCurrentProgress() {
        return this.node.getExecutionStateHelper().getRunningNode(this.node.getNodeUuid())?.progress;
    }
    getCurrentMessage() {
        return this.node.getExecutionStateHelper().getRunningNode(this.node.getNodeUuid())?.message;
    }
    updateProgress(progress) {
        this.node.getExecutionStateHelper().updateProgressAndMessage({ progress }, this.node.getNodeUuid());
    }
    updateMessage(message) {
        this.node.getExecutionStateHelper().updateProgressAndMessage({ message }, this.node.getNodeUuid());
    }
    updateProgressAndMessage(progress, message) {
        this.node.getExecutionStateHelper().updateProgressAndMessage({ progress, message }, this.node.getNodeUuid());
    }
    addNodeLog(logMessage) {
        const nodeResult = this.node.getStreamResult().nodeResults.find(result => result.nodeUuid === this.node.getNodeUuid());
        if (nodeResult) {
            if (nodeResult.logs) {
                nodeResult.logs.push(logMessage);
            }
            else {
                nodeResult.logs = [logMessage];
            }
        }
    }
}
class Inputs {
    node;
    constructor(node) {
        this.node = node;
    }
    getInputs() {
        const inputs = this.node.getInputs();
        if (inputs) {
            return inputs;
        }
        return [];
    }
    getInputByName(inputName) {
        return this.node.getInputs()?.find(i => i.name === inputName);
    }
    getPreresolvedInputByName(inputName) {
        const spec = this.node.getNodeSpecification();
        if ((0, wave_1.isStreamNodeSpecificationV1)(spec) || (0, wave_1.isStreamNodeSpecificationV2)(spec) || (0, wave_1.isStreamNodeSpecificationV3)(spec)) {
            return spec.inputs?.find(i => i.name === inputName);
        }
        else {
            throw new UnknownStreamNodeSpecificationVersion_1.default(spec);
        }
    }
    getInputValueByInputName(inputName) {
        return this.node.getInputs()?.find(i => i.name === inputName)?.value;
    }
    getInputOriginalValueByInputName(inputName) {
        return this.node.getInputs()?.find(i => i.name === inputName)?.originalValue;
    }
}
class Outputs {
    node;
    executor;
    constructor(node, executor) {
        this.node = node;
        this.executor = executor;
    }
    getAllOutputs() {
        const outputs = this.node.getOutputs();
        if (outputs) {
            return outputs;
        }
        return [];
    }
    getOutputByName(outputName) {
        return this.node.getOutputs()?.find(i => i.name === outputName);
    }
    getOutputValueByOutputName(outputName) {
        return this.node.getOutputs()?.find(i => i.name === outputName)?.value;
    }
    setOutput(name, value, type) {
        this.node.setOutput(name, value, type);
    }
    async executeAdditionalConnector(connectorName) {
        const nodeUUID = this.node.additionalConnectors?.find(c => c.name === connectorName)?.targetUuid;
        if (nodeUUID) {
            return this.executor.process(false, this.node.getExecutionStateHelper(), nodeUUID, true);
        }
        return undefined;
    }
}
class FileAndFolderHelper {
    node;
    constructor(node) {
        this.node = node;
    }
    async createFile(filePath, duplicateFileOption) {
        const executionStateHelper = this.node.getExecutionStateHelper();
        const fileExists = await promises_1.default
            .stat(filePath)
            .then(s => s)
            .catch(() => false);
        if (fileExists) {
            switch (duplicateFileOption) {
                case DuplicateFileOptionEnum_1.DuplicateFileOption.OVERWRITE:
                    executionStateHelper.setStreamMessage("Creating file (existing file with same name found, will be overwritten)...");
                    break;
                case DuplicateFileOptionEnum_1.DuplicateFileOption.RENAME_EXISTING:
                    executionStateHelper.setStreamMessage("Creating file (existing file with same name found, existing file will be renamed)...");
                    await promises_1.default.rename(filePath, await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(filePath));
                    break;
                case DuplicateFileOptionEnum_1.DuplicateFileOption.INCREMENT_NAME:
                    filePath = await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(filePath);
                    executionStateHelper.setStreamMessage(`Creating file (existing file with same name found, file will be created as "${filePath}")...`);
                    break;
                case DuplicateFileOptionEnum_1.DuplicateFileOption.FAIL:
                    throw new Error(`Unexpected error when creating file: File ${filePath} already exists`);
                case DuplicateFileOptionEnum_1.DuplicateFileOption.SKIP:
                default:
                    executionStateHelper.setStreamMessage(`Creating file aborted: File ${filePath} already exists`);
                    return filePath;
            }
        }
        else {
            executionStateHelper.setStreamMessage(`Creating file...`);
        }
        await promises_1.default.writeFile(filePath, "");
        return filePath;
    }
    async createFolder(folderPath, duplicateFolderOption) {
        const executionStateHelper = this.node.getExecutionStateHelper();
        const folderExists = await promises_1.default
            .stat(folderPath)
            .then(s => s)
            .catch(() => false);
        if (folderExists) {
            switch (duplicateFolderOption) {
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.RENAME_EXISTING:
                    executionStateHelper.setStreamMessage("Creating folder (existing folder with same name found, existing folder will be renamed)...");
                    await promises_1.default.rename(folderPath, await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(folderPath));
                    break;
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.INCREMENT_NAME:
                    folderPath = await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(folderPath);
                    executionStateHelper.setStreamMessage(`Creating folder (existing folder with same name found, folder will be created as "${folderPath}")...`);
                    break;
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.FAIL:
                    throw new Error(`Unexpected error when creating folder: Folder ${folderPath} already exists`);
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.SKIP:
                default:
                    executionStateHelper.setStreamMessage(`Creating folder aborted: File ${folderPath} already exists`);
                    return folderPath;
            }
        }
        else {
            executionStateHelper.setStreamMessage(`Creating folder...`);
        }
        await promises_1.default.mkdir(folderPath, { recursive: true });
        return folderPath;
    }
    async copyFile(srcFilePath, destFilePath, duplicateFileOption, progressCallback, getSrcChecksum, abortSignal) {
        const executionStateHelper = this.node.getExecutionStateHelper();
        const fileExists = await promises_1.default
            .stat(destFilePath)
            .then(s => s)
            .catch(() => false);
        if (fileExists) {
            switch (duplicateFileOption) {
                case DuplicateFileOptionEnum_1.DuplicateFileOption.OVERWRITE:
                    executionStateHelper.setStreamMessage("Copying file (existing destination file found, will be overwritten)...");
                    break;
                case DuplicateFileOptionEnum_1.DuplicateFileOption.RENAME_EXISTING:
                    executionStateHelper.setStreamMessage("Copying file (existing destination file found, existing destination file will be renamed)...");
                    await promises_1.default.rename(destFilePath, await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(destFilePath));
                    break;
                case DuplicateFileOptionEnum_1.DuplicateFileOption.INCREMENT_NAME:
                    destFilePath = await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(destFilePath);
                    executionStateHelper.setStreamMessage(`Copying file (existing destination file found, the file to copy will be saved as "${destFilePath}")...`);
                    break;
                case DuplicateFileOptionEnum_1.DuplicateFileOption.FAIL:
                    throw new Error(`Unexpected error when copying file: Destination file ${destFilePath} already exists`);
                case DuplicateFileOptionEnum_1.DuplicateFileOption.SKIP:
                default:
                    executionStateHelper.setStreamMessage(`Copying file aborted: Destination file ${destFilePath} already exists`);
                    return { finalPath: srcFilePath };
            }
        }
        else {
            executionStateHelper.setStreamMessage("Copying file...");
        }
        const checksum = await (0, FileAndFolderHelper_1._copyFile)(srcFilePath, destFilePath, progressCallback, getSrcChecksum, abortSignal);
        if (getSrcChecksum) {
            return { finalPath: destFilePath, srcChecksum: checksum };
        }
        else {
            return destFilePath;
        }
    }
    async copyFolder(srcFolderPath, destFolderPath, duplicateFolderOption, progressCallback, getSrcChecksum, abortSignal) {
        const executionStateHelper = this.node.getExecutionStateHelper();
        const folderExists = await promises_1.default
            .stat(destFolderPath)
            .then(s => s)
            .catch(() => false);
        if (folderExists) {
            switch (duplicateFolderOption) {
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.RENAME_EXISTING:
                    executionStateHelper.setStreamMessage("Copying folder (existing destination folder found, existing destination folder will be renamed)...");
                    await promises_1.default.rename(destFolderPath, await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(destFolderPath));
                    break;
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.INCREMENT_NAME:
                    destFolderPath = await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(destFolderPath);
                    executionStateHelper.setStreamMessage(`Copying folder (existing destination folder found, the folder to copy will be saved as "${destFolderPath}")...`);
                    break;
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.FAIL:
                    throw new Error(`Unexpected error when copying folder: Destination folder ${destFolderPath} already exists`);
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.SKIP:
                default:
                    executionStateHelper.setStreamMessage(`Copying folder aborted: Destination folder ${destFolderPath} already exists`);
                    return { finalPath: srcFolderPath };
            }
        }
        else {
            executionStateHelper.setStreamMessage("Copying folder...");
        }
        const checksum = await (0, FileAndFolderHelper_1._copyFolder)(srcFolderPath, destFolderPath, progressCallback, getSrcChecksum, abortSignal);
        if (getSrcChecksum) {
            return { finalPath: destFolderPath, srcChecksum: checksum };
        }
        else {
            return destFolderPath;
        }
    }
    async moveFile(srcFilePath, destFilePath, duplicateFileOption, progressCallback, getSrcChecksum, abortSignal) {
        const executionStateHelper = this.node.getExecutionStateHelper();
        const fileExists = await promises_1.default
            .stat(destFilePath)
            .then(s => s)
            .catch(() => false);
        if (fileExists) {
            switch (duplicateFileOption) {
                case DuplicateFileOptionEnum_1.DuplicateFileOption.OVERWRITE:
                    executionStateHelper.setStreamMessage("Moving file (existing destination file found, will be overwritten)...");
                    break;
                case DuplicateFileOptionEnum_1.DuplicateFileOption.RENAME_EXISTING:
                    executionStateHelper.setStreamMessage("Moving file (existing destination file found, existing destination file will be renamed)...");
                    await promises_1.default.rename(destFilePath, await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(destFilePath));
                    break;
                case DuplicateFileOptionEnum_1.DuplicateFileOption.INCREMENT_NAME:
                    destFilePath = await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(destFilePath);
                    executionStateHelper.setStreamMessage(`Moving file (existing destination file found, the file to move will be saved as "${destFilePath}")...`);
                    break;
                case DuplicateFileOptionEnum_1.DuplicateFileOption.FAIL:
                    throw new Error(`Unexpected error when moving file: Destination file ${destFilePath} already exists`);
                case DuplicateFileOptionEnum_1.DuplicateFileOption.SKIP:
                default:
                    executionStateHelper.setStreamMessage(`Moving file aborted: Destination file ${destFilePath} already exists`);
                    return { finalPath: srcFilePath };
            }
        }
        else {
            executionStateHelper.setStreamMessage("Moving file...");
        }
        const checksum = await (0, FileAndFolderHelper_1._moveFile)(srcFilePath, destFilePath, progressCallback, getSrcChecksum, abortSignal);
        if (getSrcChecksum) {
            return { finalPath: destFilePath, srcChecksum: checksum };
        }
        else {
            return destFilePath;
        }
    }
    async moveFolder(srcFolderPath, destFolderPath, duplicateFolderOption, progressCallback, getSrcChecksum, abortSignal) {
        const executionStateHelper = this.node.getExecutionStateHelper();
        const folderExists = await promises_1.default
            .stat(destFolderPath)
            .then(s => s)
            .catch(() => false);
        if (folderExists) {
            switch (duplicateFolderOption) {
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.RENAME_EXISTING:
                    executionStateHelper.setStreamMessage("Moving folder (existing destination folder found, existing destination folder will be renamed)...");
                    await promises_1.default.rename(destFolderPath, await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(destFolderPath));
                    break;
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.INCREMENT_NAME:
                    destFolderPath = await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(destFolderPath);
                    executionStateHelper.setStreamMessage(`Moving folder (existing destination folder found, the folder to move will be saved as "${destFolderPath}")...`);
                    break;
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.FAIL:
                    throw new Error(`Unexpected error when moving folder: Destination folder ${destFolderPath} already exists`);
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.SKIP:
                default:
                    executionStateHelper.setStreamMessage(`Moving folder aborted: Destination folder ${destFolderPath} already exists`);
                    return { finalPath: srcFolderPath };
            }
        }
        else {
            executionStateHelper.setStreamMessage("Moving folder...");
        }
        const checksum = await (0, FileAndFolderHelper_1._moveFolder)(srcFolderPath, destFolderPath, progressCallback, getSrcChecksum, abortSignal);
        if (getSrcChecksum) {
            return { finalPath: destFolderPath, srcChecksum: checksum };
        }
        else {
            return destFolderPath;
        }
    }
    async renameFile(filePath, newName, duplicateFileOption) {
        const executionStateHelper = this.node.getExecutionStateHelper();
        let newFilePath = path_1.default.join(path_1.default.dirname(filePath), newName);
        const fileExists = await promises_1.default
            .stat(newFilePath)
            .then(s => s)
            .catch(() => false);
        if (fileExists) {
            switch (duplicateFileOption) {
                case DuplicateFileOptionEnum_1.DuplicateFileOption.OVERWRITE:
                    executionStateHelper.setStreamMessage("Renaming file (existing file with same name found, it will be overwritten)...");
                    break;
                case DuplicateFileOptionEnum_1.DuplicateFileOption.RENAME_EXISTING:
                    executionStateHelper.setStreamMessage("Renaming file (existing file with same name found, it will be renamed)...");
                    await promises_1.default.rename(newFilePath, await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(newFilePath));
                    break;
                case DuplicateFileOptionEnum_1.DuplicateFileOption.INCREMENT_NAME:
                    newFilePath = await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(newFilePath);
                    executionStateHelper.setStreamMessage(`Renaming file (existing file with same name found, the file to rename will be saved as "${newFilePath}") instead...`);
                    break;
                case DuplicateFileOptionEnum_1.DuplicateFileOption.FAIL:
                    throw new Error(`Unexpected error when renaming file: File ${newFilePath} already exists`);
                case DuplicateFileOptionEnum_1.DuplicateFileOption.SKIP:
                default:
                    executionStateHelper.setStreamMessage(`Renaming file aborted: File ${newFilePath} already exists`);
                    return filePath;
            }
        }
        else {
            executionStateHelper.setStreamMessage("Renaming file...");
        }
        await promises_1.default.rename(filePath, newFilePath);
        return newFilePath;
    }
    async renameFolder(folderPath, newName, duplicateFolderOption) {
        const executionStateHelper = this.node.getExecutionStateHelper();
        folderPath = folderPath.endsWith("/") || folderPath.endsWith("\\") ? folderPath.slice(0, -1) : folderPath;
        let newFolderPath = path_1.default.join(path_1.default.dirname(folderPath), newName);
        const folderExists = await promises_1.default
            .stat(newFolderPath)
            .then(s => s)
            .catch(() => false);
        if (folderExists) {
            switch (duplicateFolderOption) {
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.RENAME_EXISTING:
                    executionStateHelper.setStreamMessage("Renaming folder (existing folder with same name found, it will be renamed)...");
                    await promises_1.default.rename(newFolderPath, await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(newFolderPath));
                    break;
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.INCREMENT_NAME:
                    newFolderPath = await (0, FileAndFolderHelper_1.incrementFileOrFolderName)(newFolderPath);
                    executionStateHelper.setStreamMessage(`Renaming folder (existing folder with same name found, the folder to rename will be saved as "${newFolderPath}") instead...`);
                    break;
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.FAIL:
                    throw new Error(`Unexpected error when renaming folder: Folder ${newFolderPath} already exists`);
                case DuplicateFolderOptionEnum_1.DuplicateFolderOption.SKIP:
                default:
                    executionStateHelper.setStreamMessage(`Renaming folder aborted: Folder ${newFolderPath} already exists`);
                    return folderPath;
            }
        }
        else {
            executionStateHelper.setStreamMessage("Renaming folder...");
        }
        await promises_1.default.rename(folderPath, newFolderPath);
        return newFolderPath;
    }
    async deleteFile(filePath) {
        this.node.getExecutionStateHelper().setStreamMessage("Deleting file...");
        await promises_1.default.rm(filePath);
    }
    async deleteFolder(folderPath) {
        this.node.getExecutionStateHelper().setStreamMessage("Deleting folder...");
        await promises_1.default.rm(folderPath, { recursive: true, force: false });
    }
    async getFileMd5Hash(filePath, signal) {
        return await (0, FileAndFolderHelper_1._getFileMd5Hash)(filePath, signal);
    }
    async getFolderMd5Hash(folderPath, signal) {
        return await (0, FileAndFolderHelper_1._getFolderMd5Hash)(folderPath, signal);
    }
}
class AxiosHelper {
    async makeRequest(config) {
        try {
            return (await (0, axios_1.default)(config)).data;
        }
        catch (err) {
            if (axios_1.default.isAxiosError(err)) {
                if (err.response && typeof err.response.data === "string") {
                    throw new Error(`Axios Error: ${err.response.data} (${err.response.status})`);
                }
                else if (err.response && err.response.data && err.response.data.message) {
                    throw new Error(`Axios Error: ${err.response.data.message} (${err.response.status})`);
                }
                else {
                    throw new Error(`Axios Error: ${err.message} (${err.response?.status})`);
                }
            }
            else {
                throw err;
            }
        }
    }
    convertRequestToCurl(config) {
        let curl = `curl -X ${config.method?.toUpperCase()} \\\n`;
        if (config.headers) {
            for (const header in config.headers) {
                curl += `  -H "${header}: ${config.headers[header]}" \\\n`;
            }
        }
        if (config.data) {
            curl += `  -d '${JSON.stringify(config.data)}' \\\n`;
        }
        if (config.timeout) {
            const maxTimeInSeconds = Math.ceil(config.timeout / 1000);
            curl += `  --max-time ${maxTimeInSeconds} \\\n`;
        }
        if (config.httpsAgent && config.httpsAgent.options && config.httpsAgent.options.rejectUnauthorized === false) {
            curl += `  --insecure \\\n`;
        }
        if (config.maxRedirects !== undefined) {
            if (config.maxRedirects > 0) {
                curl += `  -L --max-redirs ${config.maxRedirects} \\\n`;
            }
        }
        else {
            curl += `  -L --max-redirs 5 \\\n`;
        }
        let url = config.url;
        if (url && config.params) {
            const serialize = (params, prefix = "") => {
                return Object.keys(params)
                    .map(key => {
                    const value = params[key];
                    const paramKey = prefix ? `${prefix}[${encodeURIComponent(key)}]` : encodeURIComponent(key);
                    if (Array.isArray(value)) {
                        return value.map((v) => `${paramKey}=${encodeURIComponent(v)}`).join("&");
                    }
                    else if (typeof value === "object" && value !== null) {
                        return serialize(value, paramKey);
                    }
                    else {
                        return `${paramKey}=${encodeURIComponent(value)}`;
                    }
                })
                    .join("&");
            };
            const paramsString = serialize(config.params);
            url += (url.includes("?") ? "&" : "?") + paramsString;
        }
        curl += `  "${url}"`;
        return curl;
    }
    removeEmptyFields(obj) {
        const cleanObject = (item) => {
            if (Array.isArray(item)) {
                const cleanedArray = item
                    .map(cleanObject)
                    .filter(val => val !== undefined && val !== null && !((Array.isArray(val) && val.length === 0) || (typeof val === "object" && Object.keys(val).length === 0)));
                return cleanedArray.length > 0 ? cleanedArray : undefined;
            }
            else if (item !== null && typeof item === "object") {
                const cleanedItem = Object.entries(item).reduce((acc, [key, value]) => {
                    const cleanedValue = cleanObject(value);
                    if (cleanedValue !== undefined &&
                        cleanedValue !== null &&
                        !((typeof cleanedValue === "string" && cleanedValue.trim() === "") ||
                            (Array.isArray(cleanedValue) && cleanedValue.length === 0) ||
                            (typeof cleanedValue === "object" && Object.keys(cleanedValue).length === 0))) {
                        acc[key] = cleanedValue;
                    }
                    return acc;
                }, {});
                return Object.keys(cleanedItem).length > 0 ? cleanedItem : undefined;
            }
            else if (item === undefined || item === null || (typeof item === "string" && item.trim() === "")) {
                return undefined;
            }
            return item;
        };
        const cleanedObj = cleanObject(obj);
        return cleanedObj !== undefined ? cleanedObj : {};
    }
}
exports.AxiosHelper = AxiosHelper;
