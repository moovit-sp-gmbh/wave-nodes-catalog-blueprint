import { StreamSingleNodeResult as SDKStreamSingleNodeResult, StreamNodeOutput, StreamNodeResultError } from "hcloud-sdk/lib/interfaces/high5/space/event/stream/node";
import { StreamNode } from "hcloud-sdk/lib/interfaces/high5/space/execution";
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
    duration?: number | undefined;
    bypassed?: boolean | undefined;
    nodeResults?: StreamSingleNodeResult[] | undefined;
    streamNode: StreamNode & {
        catalog: {
            name?: string;
        };
    };
    get info(): SDKStreamSingleNodeResult["info"];
    static create(obj: object): StreamSingleNodeResult;
    lean(): SDKStreamSingleNodeResult;
}
