import { StreamResult as SDKStreamResult } from "hcloud-sdk/lib/interfaces/high5";
import { ExtendedHigh5ExecutionPackage } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import ExecutionStateHelper from "../helpers/ExecutionStateHelper";
import { StreamResult } from "../models/StreamResult";
declare class StreamRunner {
    agentInfo: AgentInfo;
    executionPackage: ExtendedHigh5ExecutionPackage;
    protected streamResult: StreamResult;
    protected executionStateHelper: ExecutionStateHelper;
    extraCatalogLocations?: string[];
    catalogPath?: string;
    /**
     * StreamRunner runs the actual stream
     */
    constructor(executionPackage: ExtendedHigh5ExecutionPackage, streamResult?: StreamResult, catalogPath?: string, agentInfo?: AgentInfo);
    /**
     * run starts the stream execution beginning with the first node (startNode)
     */
    process(dry: boolean, executionStateHelper: ExecutionStateHelper, nextNodeUUID?: string, isAdditionalConnector?: boolean, extraCatalogLocations?: string[]): Promise<SDKStreamResult>;
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
export { StreamRunner as default };
