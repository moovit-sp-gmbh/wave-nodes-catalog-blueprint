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
exports.moveFolderWithProgress = exports.moveFileWithProgress = exports.copyFolderWithProgress = exports.copyFileWithProgress = exports.incrementFileName = void 0;
const cp_file_1 = __importDefault(require("cp-file"));
const promises_1 = __importStar(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function incrementFileName(destFile) {
    const dirname = path_1.default.dirname(destFile);
    const files = await promises_1.default.readdir(dirname);
    const extension = path_1.default.extname(destFile);
    const basename = path_1.default.basename(destFile, extension);
    for (let i = 1;; ++i) {
        if (!files.includes(`${basename}_${i}${extension}`)) {
            return path_1.default.join(dirname, `${basename}_${i}${extension}`);
        }
    }
}
exports.incrementFileName = incrementFileName;
async function copyFileWithProgress(srcPath, destPath, progressCallback) {
    const copyOperation = (0, cp_file_1.default)(srcPath, destPath);
    if (progressCallback) {
        let lastProgress = 0;
        let lastExecutionTime = 0;
        copyOperation.on("progress", (data) => {
            const currentProgress = Math.floor(data.percent * 100);
            const now = Date.now();
            if (currentProgress > lastProgress && (now - lastExecutionTime >= 1000 || data.percent === 1)) {
                progressCallback(currentProgress);
                lastProgress = currentProgress;
                lastExecutionTime = now;
            }
        });
    }
}
exports.copyFileWithProgress = copyFileWithProgress;
async function copyFolderWithProgress(srcPath, destPath, progressCallback) {
    const totalSize = await getFolderSize(srcPath);
    const progressData = {
        totalSize: totalSize,
        bytesCopied: 0,
        lastEmittedPercent: 0,
    };
    await _copyFolderWithProgress(srcPath, destPath, progressData, progressCallback);
    if (progressCallback)
        progressCallback(100);
}
exports.copyFolderWithProgress = copyFolderWithProgress;
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
async function _copyFolderWithProgress(srcFolderPath, destFolderPath, progressData, progressCallback) {
    await promises_1.default.mkdir(destFolderPath, { recursive: true }).catch(() => {
    });
    const entries = await promises_1.default.readdir(srcFolderPath);
    for (const entry of entries) {
        const srcPath = path_1.default.join(srcFolderPath, entry);
        const destPath = path_1.default.join(destFolderPath, entry);
        const stat = await promises_1.default.stat(srcPath);
        if (stat.isDirectory()) {
            await _copyFolderWithProgress(srcPath, destPath, progressData, progressCallback);
        }
        else {
            if (!progressCallback) {
                await (0, cp_file_1.default)(srcPath, destPath);
            }
            else {
                let lastPercent = 0;
                let lastExecutionTime = 0;
                await (0, cp_file_1.default)(srcPath, destPath).on("progress", p => {
                    const deltaBytes = (p.percent - lastPercent) * stat.size;
                    lastPercent = p.percent;
                    progressData.bytesCopied += deltaBytes;
                    const overallPercent = (progressData.bytesCopied / progressData.totalSize) * 100;
                    const percentDifference = overallPercent - progressData.lastEmittedPercent;
                    const now = Date.now();
                    if ((percentDifference >= 1 && now - lastExecutionTime >= 1000) || overallPercent === 100) {
                        progressCallback(overallPercent);
                        progressData.lastEmittedPercent = overallPercent;
                        lastExecutionTime = now;
                    }
                });
                if (lastPercent < 1) {
                    const remainingBytes = (1 - lastPercent) * stat.size;
                    progressData.bytesCopied += remainingBytes;
                    const overallPercent = (progressData.bytesCopied / progressData.totalSize) * 100;
                    progressCallback(overallPercent);
                }
            }
        }
    }
}
async function moveFileWithProgress(srcPath, destPath, progressCallback) {
    if (progressCallback) {
        let lastProgress = 0;
        let lastExecutionTime = 0;
        await (0, cp_file_1.default)(srcPath, destPath).on("progress", data => {
            const now = Date.now();
            if (now - lastExecutionTime >= 1000 || data.percent === 1) {
                const currentProgress = Math.floor(data.percent * 100);
                if (currentProgress > lastProgress) {
                    progressCallback(currentProgress);
                    lastProgress = currentProgress;
                    lastExecutionTime = now;
                }
            }
        });
    }
    else {
        await (0, cp_file_1.default)(srcPath, destPath);
    }
    await (0, promises_1.unlink)(srcPath);
}
exports.moveFileWithProgress = moveFileWithProgress;
async function moveFolderWithProgress(srcPath, destPath, progressCallback) {
    await copyFolderWithProgress(srcPath, destPath, progressCallback);
    await (0, promises_1.rm)(srcPath, { recursive: true, force: true });
}
exports.moveFolderWithProgress = moveFolderWithProgress;
