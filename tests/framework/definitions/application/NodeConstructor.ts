import { ExtendedHigh5ExecutionPackage } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import type Node from "../../engine/build/nodes/Node";
import type { StreamNodeAdditionalConnector, StreamNodeInput } from "../engine/build/models/StreamNode";
import type { StreamResult } from "../engine/build/models/StreamResult";

declare type NodeConstructor = new (
    executionPackage: ExtendedHigh5ExecutionPackage,
    streamResult: StreamResult,
    inputs?: StreamNodeInput[],
    additionalConnectors?: StreamNodeAdditionalConnector[]
) => Node;

export { NodeConstructor };
