import { ExtendedHigh5ExecutionPackage, StreamNode } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import { StreamNodeAdditionalConnector, StreamNodeInput } from "../models/StreamNode";
import { StreamResult } from "../models/StreamResult";
import Node from "../nodes/Node";

export declare const NODE_CATALOG_NAME: unique symbol;
type NodeConstructor = new (
    executionPackage: ExtendedHigh5ExecutionPackage,
    streamResult: StreamResult,
    inputs?: StreamNodeInput[],
    additionalConnectors?: StreamNodeAdditionalConnector[]
) => Node;
export declare function requireNodeByPath(
    streamNode: StreamNode,
    catalogPath?: string,
    isAdditionalConnector?: boolean,
    extraCatalogLocations?: string[],
    authToken?: string
): Promise<
    NodeConstructor & {
        [NODE_CATALOG_NAME]?: string;
    }
>;
export {};
