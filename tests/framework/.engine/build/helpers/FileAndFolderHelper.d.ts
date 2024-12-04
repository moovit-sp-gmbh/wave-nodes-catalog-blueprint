export declare function incrementFileName(destFile: string): Promise<string>;
export declare function copyFileWithProgress(srcPath: string, destPath: string, progressCallback?: (percent: number) => void): Promise<void>;
export declare function copyFolderWithProgress(srcPath: string, destPath: string, progressCallback?: (percent: number) => void): Promise<void>;
export declare function moveFileWithProgress(srcPath: string, destPath: string, progressCallback?: (percent: number) => void): Promise<void>;
export declare function moveFolderWithProgress(srcPath: string, destPath: string, progressCallback?: (percent: number) => void): Promise<void>;
