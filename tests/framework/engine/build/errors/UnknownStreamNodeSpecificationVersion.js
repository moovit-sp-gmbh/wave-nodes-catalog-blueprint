"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UnknownStreamNodeSpecificationVersion extends Error {
    constructor(version) {
        if (typeof version === "object") {
            version = version.specVersion;
        }
        super(`Unknown node specification version encountered: '${version}'`);
    }
}
exports.default = UnknownStreamNodeSpecificationVersion;
