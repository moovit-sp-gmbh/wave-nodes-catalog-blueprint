"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMacOSFreeMem = void 0;
const child_process_1 = require("child_process");
const os_1 = __importDefault(require("os"));
const util_1 = require("util");
const PAGE_SIZE_REGEX = /page size of (\d+) bytes/;
async function getMacOSFreeMem() {
    const { stdout: vmStatOut } = await (0, util_1.promisify)(child_process_1.exec)("vm_stat");
    const lines = vmStatOut.split("\n");
    const pgeSizeRgxRes = PAGE_SIZE_REGEX.exec(lines[0]);
    if (pgeSizeRgxRes === null) {
        return os_1.default.freemem();
    }
    const pageSize = parseInt(pgeSizeRgxRes[1], 10);
    const pageInfo = lines.slice(1).reduce((acc, line) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) {
            return acc;
        }
        const key = line.substring(0, colonIndex).trim();
        const value = parseFloat(line.substring(colonIndex + 1).trim());
        acc[key] = value;
        return acc;
    }, {});
    const { stdout: pageablePagesStdOut } = await (0, util_1.promisify)(child_process_1.exec)("sysctl vm.page_pageable_internal_count");
    const [, pageablePagesStr] = pageablePagesStdOut.split(":");
    const pageablePages = Number(pageablePagesStr.trim());
    if (isNaN(pageablePages)) {
        return os_1.default.freemem();
    }
    else {
        const usedmem = (pageInfo["Pages wired down"] + pageInfo["Pages occupied by compressor"] + pageablePages - pageInfo["Pages purgeable"]) * pageSize;
        return os_1.default.totalmem() - usedmem;
    }
}
exports.getMacOSFreeMem = getMacOSFreeMem;
