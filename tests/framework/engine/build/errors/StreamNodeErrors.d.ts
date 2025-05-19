import { StreamNodeResultError } from "hcloud-sdk/lib/interfaces/high5/space/event/stream/node";
declare abstract class StreamNodeError extends Error {
    protected code: number;
    protected detail: string;
    constructor();
    getCode(): number;
    getDetail(): string;
    getMessage(): string;
    toJson(): StreamNodeResultError;
}
declare class StreamNodeGenericError extends StreamNodeError {
    constructor(err: Error, detail?: string);
}
declare class StreamNodeInputMissingError extends StreamNodeError {
    constructor(input: string);
}
declare class StreamNodeInputTypeError extends StreamNodeError {
    constructor(input: string, want: string, got: string);
}
declare class StreamNodeNotFoundError extends StreamNodeError {
    constructor(detail: string);
}
declare class StreamNodePathNotFoundError extends StreamNodeError {
    constructor(error: Error, detail: string);
}
declare class StreamWildcardReplacerError extends StreamNodeError {
    constructor(error: Error, detail: string);
}
declare class StreamNodePathTypeNotImplementedError extends StreamNodeError {
    constructor(error: Error, detail: string);
}
export {
    StreamNodeError,
    StreamNodeGenericError,
    StreamNodeInputMissingError,
    StreamNodeInputTypeError,
    StreamNodeNotFoundError,
    StreamNodePathNotFoundError,
    StreamWildcardReplacerError,
    StreamNodePathTypeNotImplementedError,
};
