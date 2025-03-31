"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getFolderMd5Hash = exports._getFileMd5Hash = exports._moveFolder = exports._copyFolder = exports._moveFile = exports._copyFile = exports.incrementFileOrFolderName = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = require("fs");
const promises_1 = __importStar(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const promises_2 = require("stream/promises");
async function incrementFileOrFolderName(destPath) {
    const dirname = path_1.default.dirname(destPath);
    const contents = await promises_1.default.readdir(dirname);
    const extension = path_1.default.extname(destPath);
    const basename = path_1.default.basename(destPath, extension);
    for (let i = 1;; ++i) {
        if (!contents.includes(`${basename}_${i}${extension}`)) {
            return path_1.default.join(dirname, `${basename}_${i}${extension}`);
        }
    }
}
exports.incrementFileOrFolderName = incrementFileOrFolderName;
async function getFolderSize(srcPath) {
    let totalSize = 0;
    const entries = await promises_1.default.readdir(srcPath);
    for (const entry of entries) {
        const fullPath = path_1.default.join(srcPath, entry);
        const stat = await promises_1.default.stat(fullPath);
        if (stat.isDirectory()) {
            totalSize += await getFolderSize(fullPath);
        }
        else {
            totalSize += stat.size;
        }
    }
    return totalSize;
}
async function _copyFile(srcPath, destPath, progressCallback, getSrcChecksum, signal) {
    const { size: totalSize } = await (0, promises_1.stat)(srcPath);
    let bytesCopied = 0;
    let lastProgress = 0;
    let lastExecutionTime = 0;
    let aborted = false;
    const hash = getSrcChecksum ? crypto_1.default.createHash("md5") : null;
    const readStream = (0, fs_1.createReadStream)(srcPath);
    const writeStream = (0, fs_1.createWriteStream)(destPath);
    const destroyStream = () => {
        aborted = true;
        readStream.destroy();
        writeStream.destroy();
    };
    if (signal) {
        signal.addEventListener("abort", destroyStream);
    }
    readStream.on("data", chunk => {
        if (hash) {
            hash.update(chunk);
        }
        bytesCopied += chunk.length;
        const now = Date.now();
        const percent = Math.floor((bytesCopied / totalSize) * 100);
        if (!progressCallback)
            return;
        if (now - lastExecutionTime >= 1000 && percent > lastProgress && percent !== 100) {
            progressCallback(percent);
            lastProgress = percent;
            lastExecutionTime = now;
        }
    });
    try {
        await (0, promises_2.pipeline)(readStream, writeStream);
        if (progressCallback && !aborted) {
            progressCallback(100);
        }
        if (hash && !aborted) {
            return hash.digest("hex");
        }
        return undefined;
    }
    finally {
        if (signal) {
            signal.removeEventListener("abort", destroyStream);
        }
    }
}
exports._copyFile = _copyFile;
async function _moveFile(srcPath, destPath, progressCallback, getSrcChecksum, signal) {
    const srcChecksum = await _copyFile(srcPath, destPath, progressCallback, getSrcChecksum, signal);
    await (0, promises_1.unlink)(srcPath);
    return srcChecksum;
}
exports._moveFile = _moveFile;
async function _copyFolder(srcPath, destPath, progressCallback, getSrcChecksum, abortSignal) {
    const totalSize = await getFolderSize(srcPath);
    const progressData = {
        totalSize: totalSize,
        bytesCopied: 0,
        lastEmittedPercent: 0,
    };
    const allFileChecksums = await copyFolderRecursively(srcPath, destPath, progressData, progressCallback, getSrcChecksum, abortSignal);
    if (progressCallback && progressData.lastEmittedPercent < 100)
        progressCallback(100);
    if (getSrcChecksum && allFileChecksums) {
        const combinedAndSortedChecksums = allFileChecksums.sort().join("");
        return crypto_1.default.createHash("md5").update(combinedAndSortedChecksums).digest("hex");
    }
    else {
        return undefined;
    }
}
exports._copyFolder = _copyFolder;
async function copyFolderRecursively(srcFolderPath, destFolderPath, progressData, progressCallback, getSrcChecksum, abortSignal) {
    await promises_1.default.mkdir(destFolderPath, { recursive: true }).catch(() => {
    });
    const entries = await promises_1.default.readdir(srcFolderPath);
    const allFileChecksums = [];
    for (const entry of entries) {
        const srcPath = path_1.default.join(srcFolderPath, entry);
        const destPath = path_1.default.join(destFolderPath, entry);
        const fileStat = await promises_1.default.stat(srcPath);
        if (fileStat.isDirectory()) {
            const checksums = await copyFolderRecursively(srcPath, destPath, progressData, progressCallback, getSrcChecksum, abortSignal);
            if (checksums) {
                allFileChecksums.push(...checksums);
            }
        }
        else {
            if (!progressCallback) {
                const checksum = await _copyFile(srcPath, destPath, undefined, getSrcChecksum, abortSignal);
                if (checksum) {
                    allFileChecksums.push(checksum);
                }
            }
            else {
                let lastFilePercent = 0;
                const checksum = await _copyFile(srcPath, destPath, filePercent => {
                    const incrementBytes = ((filePercent - lastFilePercent) / 100) * fileStat.size;
                    lastFilePercent = filePercent;
                    progressData.bytesCopied += incrementBytes;
                    const overallPercent = (progressData.bytesCopied / progressData.totalSize) * 100;
                    progressCallback(overallPercent);
                }, getSrcChecksum, abortSignal);
                if (checksum) {
                    allFileChecksums.push(checksum);
                }
            }
        }
    }
    return getSrcChecksum ? allFileChecksums : undefined;
}
async function _moveFolder(srcPath, destPath, progressCallback, getSrcChecksum, abortSignal) {
    const srcChecksum = await _copyFolder(srcPath, destPath, progressCallback, getSrcChecksum, abortSignal);
    await (0, promises_1.rm)(srcPath, { recursive: true, force: true });
    return srcChecksum;
}
exports._moveFolder = _moveFolder;
async function _getFileMd5Hash(filePath, signal) {
    return new Promise((resolve, reject) => {
        const fileStream = (0, fs_1.createReadStream)(filePath);
        const hash = crypto_1.default.createHash("md5");
        let aborted = false;
        const destroyStream = () => {
            aborted = true;
            fileStream.destroy();
        };
        const cleanup = () => {
            if (signal)
                signal.removeEventListener("abort", destroyStream);
        };
        if (signal) {
            signal.addEventListener("abort", destroyStream);
        }
        fileStream.on("data", data => {
            if (!aborted)
                hash.update(data);
        });
        fileStream.on("end", () => {
            cleanup();
            if (!aborted)
                resolve(hash.digest("hex"));
        });
        fileStream.on("error", err => {
            cleanup();
            reject(err);
        });
    });
}
exports._getFileMd5Hash = _getFileMd5Hash;
async function _getFolderMd5Hash(folderPath, signal) {
    const files = await getFilesRecursively(folderPath);
    const fileChecksums = await Promise.all(files.map(file => _getFileMd5Hash(file, signal)));
    const combinedChecksums = fileChecksums.sort().join("");
    const hash = crypto_1.default.createHash("md5").update(combinedChecksums).digest("hex");
    return hash;
}
exports._getFolderMd5Hash = _getFolderMd5Hash;
async function getFilesRecursively(directory) {
    const entries = await (0, promises_1.readdir)(directory, { withFileTypes: true });
    const files = entries.filter(file => !file.isDirectory()).map(file => path_1.default.resolve(path_1.default.join(directory, file.name)));
    const directories = entries.filter(directory => directory.isDirectory());
    for (const directoryEntry of directories) {
        const directoryFiles = await getFilesRecursively(path_1.default.join(directory, directoryEntry.name));
        files.push(...directoryFiles);
    }
    return files;
}
