export declare function incrementFileOrFolderName(destPath: string): Promise<string>;
export declare function _copyFile(
    srcPath: string,
    destPath: string,
    progressCallback?: (percent: number) => void,
    getSrcChecksum?: boolean,
    signal?: AbortSignal
): Promise<string | undefined>;
export declare function _moveFile(
    srcPath: string,
    destPath: string,
    progressCallback?: (percent: number) => void,
    getSrcChecksum?: boolean,
    signal?: AbortSignal
): Promise<string | undefined>;
export declare function _copyFolder(
    srcPath: string,
    destPath: string,
    progressCallback?: (percent: number) => void,
    getSrcChecksum?: boolean,
    abortSignal?: AbortSignal
): Promise<string | undefined>;
export declare function _moveFolder(
    srcPath: string,
    destPath: string,
    progressCallback?: (percent: number) => void,
    getSrcChecksum?: boolean,
    abortSignal?: AbortSignal
): Promise<string | undefined>;
export declare function _getFileMd5Hash(filePath: string, signal?: AbortSignal): Promise<string>;
export declare function _getFolderMd5Hash(folderPath: string, signal?: AbortSignal): Promise<string>;
