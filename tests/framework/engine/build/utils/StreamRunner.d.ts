import { StreamResult as SDKStreamResult } from "hcloud-sdk/lib/interfaces/high5";
import { ExtendedHigh5ExecutionPackage, StreamNode } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import DebugClient from "../debug/client";
import ExecutionStateHelper from "../helpers/ExecutionStateHelper";
import { StreamResult } from "../models/StreamResult";
import { StreamSingleNodeResult } from "../models/StreamSingleNodeResult";

declare class StreamRunner {
    static DEBUG_TIMEOUT: number;
    agentInfo: AgentInfo;
    executionPackage: ExtendedHigh5ExecutionPackage;
    streamResult: StreamResult;
    executionStateHelper: ExecutionStateHelper;
    extraCatalogLocations?: string[];
    catalogPath?: string;
    debug?: DebugState;
    debugClient: StreamRunner["debug"] extends undefined ? undefined : DebugClient;
    currentNode?: StreamNode;
    cleanupFns: (() => Promise<void>)[];
    executionStack: {
        node: StreamNode;
        log: StreamSingleNodeResult;
    }[];
    /**
     * StreamRunner runs the actual stream
     */
    constructor(executionPackage: ExtendedHigh5ExecutionPackage, streamResult?: StreamResult, catalogPath?: string, agentInfo?: AgentInfo);
    /**
     * run starts the stream execution beginning with the first node (startNode)
     */
    process(
        dry: boolean,
        executionStateHelper: ExecutionStateHelper,
        nextNodeUUID?: string,
        isAdditionalConnector?: boolean,
        extraCatalogLocations?: string[]
    ): Promise<SDKStreamResult>;
    processDebug(dry: boolean, startNode?: StreamNode): Promise<SDKStreamResult>;
    setStreamNode(node: StreamNode): void;
    removeNodeResult(uuid: string): void;
    setNodeResultValue(uuid: string, key: string, value: unknown): void;
    cleanup(): Promise<void>;
}
export type AgentInfo = {
    os: {
        platform: string;
        type: string;
    };
    cpu: string;
    hostname: string;
    ip?: string;
    version?: string;
};
declare enum DebugState {
    NEXT = 0,
    CONTINUE = 1,
    STEP = 2,
}
export { StreamRunner as default };
