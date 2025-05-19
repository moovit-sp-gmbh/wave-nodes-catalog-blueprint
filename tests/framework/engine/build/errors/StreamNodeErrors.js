"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamNodePathTypeNotImplementedError =
    exports.StreamWildcardReplacerError =
    exports.StreamNodePathNotFoundError =
    exports.StreamNodeNotFoundError =
    exports.StreamNodeInputTypeError =
    exports.StreamNodeInputMissingError =
    exports.StreamNodeGenericError =
    exports.StreamNodeError =
        void 0;
class StreamNodeError extends Error {
    code;
    detail;
    constructor() {
        super();
    }
    getCode() {
        return this.code;
    }
    getDetail() {
        return this.detail;
    }
    getMessage() {
        return this.message;
    }
    toJson() {
        return {
            code: this.code,
            message: this.message,
            detail: this.detail,
            trace: this.stack,
        };
    }
}
exports.StreamNodeError = StreamNodeError;
class StreamNodeGenericError extends StreamNodeError {
    constructor(err, detail) {
        super();
        this.detail = detail ?? "";
        this.code = 400;
        this.message = err.message;
    }
}
exports.StreamNodeGenericError = StreamNodeGenericError;
class StreamNodeInputMissingError extends StreamNodeError {
    constructor(input) {
        super();
        this.code = 501;
        this.message = `Missing mandatory input parameter '${input}'`;
    }
}
exports.StreamNodeInputMissingError = StreamNodeInputMissingError;
class StreamNodeInputTypeError extends StreamNodeError {
    constructor(input, want, got) {
        super();
        this.code = 502;
        this.message = `Invalid type for input parameter '${input}', want '${want}' got '${got}'`;
    }
}
exports.StreamNodeInputTypeError = StreamNodeInputTypeError;
class StreamNodeNotFoundError extends StreamNodeError {
    constructor(detail) {
        super();
        this.detail = detail;
        this.code = 503;
        this.message = "Could not find node by uuid in node list";
    }
}
exports.StreamNodeNotFoundError = StreamNodeNotFoundError;
class StreamNodePathNotFoundError extends StreamNodeError {
    constructor(error, detail) {
        super();
        this.detail = detail;
        this.code = 504;
        this.message = "Could not find node by path: " + error.message;
    }
}
exports.StreamNodePathNotFoundError = StreamNodePathNotFoundError;
class StreamWildcardReplacerError extends StreamNodeError {
    constructor(error, detail) {
        super();
        this.detail = detail;
        this.code = 505;
        this.message = error.message;
    }
}
exports.StreamWildcardReplacerError = StreamWildcardReplacerError;
class StreamNodePathTypeNotImplementedError extends StreamNodeError {
    constructor(error, detail) {
        super();
        this.detail = detail;
        this.code = 506;
        this.message = error.message;
    }
}
exports.StreamNodePathTypeNotImplementedError = StreamNodePathTypeNotImplementedError;
