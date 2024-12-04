import { ExtendedHigh5ExecutionPackage } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import type { StreamNodeAdditionalConnector, StreamNodeInput } from "wave-engine/models/StreamNode";
import type { StreamResult } from "wave-engine/models/StreamResult";
import type Node from "wave-engine/nodes/Node";

declare type NodeConstructor = new (
    executionPackage: ExtendedHigh5ExecutionPackage,
    streamResult: StreamResult,
    inputs?: StreamNodeInput[],
    additionalConnectors?: StreamNodeAdditionalConnector[]
) => Node;

interface Design {
    node?: NodeConstructor;
    uuid?: number | string;
    inputs?: StreamNodeInput[];
    onSuccess?: Design;
}

export { Design };
