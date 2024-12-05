import { WaveCatalog } from "hcloud-sdk/lib/interfaces/high5";
import { DesignBuild } from "hcloud-sdk/lib/interfaces/high5/space/event/stream";
import type { StreamNodeResolvedInputs } from "hcloud-sdk/lib/interfaces/high5/space/event/stream/node";
import { StreamNode } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import { Design } from "../definitions/application/Design";

function convertDesign(design: Design): DesignBuild {
    const startNode = String(design.uuid);
    const nodes: StreamNode[] = [];
    let d: Design | undefined = design;
    while (d) {
        nodes.push({
            uuid: String(d.uuid),
            name: d.node?.name || "",
            catalog: {} as WaveCatalog,
            path: `name://${d.node?.name}`,
            onSuccess: d?.onSuccess ? String(d.onSuccess.uuid) : undefined,
            inputs: d.inputs as StreamNodeResolvedInputs[],
        });
        d = d?.onSuccess;
    }
    return { nodes, startNode } as DesignBuild;
}

export { convertDesign };
