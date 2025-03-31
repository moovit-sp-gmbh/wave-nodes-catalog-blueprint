import {
    NodeType,
    StreamSingleNodeResult as SDKStreamSingleNodeResult,
    StreamNodeOutput,
    StreamNodeResultError,
} from "hcloud-sdk/lib/interfaces/high5/space/event/stream/node";
import { StreamNode } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import Node from "../nodes/Node";
import { StreamNodeResolvedInput } from "./StreamNode";

export declare class StreamSingleNodeResult implements SDKStreamSingleNodeResult {
    uuid: string;
    nodeUuid: string;
    failed: boolean;
    startTimestamp: number;
    endTimestamp?: number;
    name: string;
    inputs?: StreamNodeResolvedInput[] | undefined;
    outputs?: StreamNodeOutput[] | undefined;
    error?: StreamNodeResultError | undefined;
    logs?: string[] | undefined;
    duration?: number | undefined;
    bypassed?: boolean | undefined;
    nodeResults?: StreamSingleNodeResult[] | undefined;
    waiting?: boolean;
    streamNode: StreamNode & {
        catalog: {
            name?: string;
        };
        color?: string;
        nodeType?: NodeType;
    };
    executableNode: Node;
    get info(): SDKStreamSingleNodeResult["info"];
    static create(obj: object): StreamSingleNodeResult;
    lean(): SDKStreamSingleNodeResult;
}
