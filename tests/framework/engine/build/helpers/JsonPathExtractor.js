"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFromJSON = extractFromJSON;
function extractFromJSON(jsonData, jsonPath) {
    if (jsonPath.length === 0) {
        return jsonData;
    }
    try {
        if (typeof jsonData === "string") {
            return extractProp(JSON.parse(jsonData), jsonPath);
        }
        return extractProp(jsonData, jsonPath);
    } catch {
        return null;
    }
}
function extractProp(o, path) {
    let curr = o;
    for (let i = 0; i < path.length && curr !== undefined && curr !== null; i++) {
        curr = curr[path[i]];
    }
    return curr;
}
