import { StreamResult as SDKStreamResult } from "hcloud-sdk/lib/interfaces/high5";
import StreamRunner from "../utils/StreamRunner";
import { StreamSingleNodeResult } from "./StreamSingleNodeResult";

export declare class StreamResult implements SDKStreamResult {
    payload: any;
    uuid: string;
    startTimestamp: number;
    endTimestamp: number;
    host: string;
    failed: boolean;
    dry?: boolean;
    nodeResults: StreamSingleNodeResult[];
    streamVariables?: Record<string, any>;
    runner: StreamRunner;
    get info(): StreamInfo;
    static create(obj: object): StreamResult;
    lean(): SDKStreamResult;
}
type StreamInfo = {
    startDate: number;
    endDate?: number;
    runTime: number;
    webhook?: {
        callbackUrl: string;
    };
    target?: string;
};
export {};
