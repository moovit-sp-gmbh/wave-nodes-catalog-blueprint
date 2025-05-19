import { StreamResult as SDKStreamResult } from "hcloud-sdk/lib/interfaces/high5";
import { ExtendedHigh5ExecutionPackage, StreamNode } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import os from "os";
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
     * @param additionalConnectorRoot - if node to be executed is triggered by additional connector, this will be the nodeUuid of root node
     */
    process(
        dry: boolean,
        executionStateHelper: ExecutionStateHelper,
        nextNodeUUID?: string,
        additionalConnectorRoot?: string,
        extraCatalogLocations?: string[]
    ): Promise<SDKStreamResult>;
    processDebug(dry: boolean, startNode?: StreamNode): Promise<SDKStreamResult>;
    setStreamNode(node: StreamNode): void;
    removeNodeResult(uuid: string): void;
    clearNodeResults(): void;
    setNodeResultValue(uuid: string, key: string, value: unknown): void;
    /**
     * Only ip and version will be used from the agentInfo comming from the Agent, the rest will be populated here in the wave-engine to
     * keep information consistent with wildcards and to avoid potential agent versioning issues.
     */
    setAgentInfo(agentInfo?: AgentInfo): void;
    setMacOSUsedMem(): Promise<void>;
    cleanup(): Promise<void>;
}
export type AgentInfo = {
    os: {
        type: string;
        platform: string;
        release: string;
        version: string;
    };
    cpu: string;
    cpuArchitecture: string;
    hostname: string;
    memory: {
        total: number;
        used: number;
    };
    connectionUptime: number;
    nics: Record<string, (os.NetworkInterfaceInfoIPv4 | os.NetworkInterfaceInfoIPv6)[]>;
    installerVersion?: string;
    ip?: string;
    version?: string;
};
declare enum DebugState {
    NEXT = 0,
    CONTINUE = 1,
    STEP = 2,
}
export { StreamRunner as default };
