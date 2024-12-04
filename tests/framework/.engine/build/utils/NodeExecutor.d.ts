import { ExtendedHigh5ExecutionPackage } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import ExecutionStateHelper from "../helpers/ExecutionStateHelper";
import { StreamNodeExecutionResult } from "../models/StreamNode";
import { StreamResult } from "../models/StreamResult";
import StreamRunner from "./StreamRunner";
/**
 * NodeExecutor will execute a single node (by uuid) and return the result (promise)
 */
export default class NodeExecutor {
    private nodeUuid;
    private executionPackage;
    private streamResult;
    /**
     * Prepare everything we need to execute a new node
     * @param nodeUuid the uuid of the node to execute
     * @param executionPackage object holding necessary information for stream execution like the payload, options etc.
     * @param streamResult holds all the results of previously executed nodes up to now (required for the WildcardResolver to resolve outputs of previous nodes)
     */
    constructor(nodeUuid: string, executionPackage: ExtendedHigh5ExecutionPackage, streamResult: StreamResult);
    process(dry: boolean, executionStateHelper: ExecutionStateHelper, runner: StreamRunner, isAdditionalConnector?: boolean, catalogPath?: string, extraCatalogLocations?: string[]): Promise<StreamNodeExecutionResult>;
    /**
     * findNodeInNodeList returns the target node from the nodeList coming from the streamPackage
     * @param uuid the uuid of the requested node
     * @returns StreamNode
     * @exception StreamNodeNotFoundError
     */
    private findNodeInNodeList;
}
