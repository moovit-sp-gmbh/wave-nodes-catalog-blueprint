import {
    StreamNodeResolvedInputs as SDKStreamNodeResolvedInputs,
    StreamSingleNodeResult,
} from "hcloud-sdk/lib/interfaces/high5/space/event/stream/node";
import { StreamNode } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import { StreamNodeSpecificationInputType, StreamNodeSpecificationOutputType } from "hcloud-sdk/lib/interfaces/high5/wave";
export interface StreamNodeOutput {
    name: string | undefined;
    value: any;
    type: StreamNodeSpecificationOutputType;
}
export interface StreamNodeInput {
    name: string;
    originalValue?: any;
    value: any;
    type: StreamNodeSpecificationInputType;
    error: boolean;
    errorMessage: string;
}
export interface StreamNodeAdditionalConnector {
    name: string;
    targetUuid: string;
}
export interface StreamNodeResolvedInput extends SDKStreamNodeResolvedInputs {
    originalValue: any;
    value: any;
    error: boolean;
    errorMessage: string;
}
export type CleanUpFunction = () => Promise<void>;
export interface StreamNodeExecutionResult {
    nodeResult: StreamSingleNodeResult;
    node: StreamNode | undefined;
    /**
     * This should only be undefined when the stream is bypassed
     */
    cleanupFn?: CleanUpFunction;
}
