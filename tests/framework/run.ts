import { High5ExecutionPayloadType } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import type { StreamNodeResolvedInputs } from "hcloud-sdk/lib/interfaces/high5/space/event/stream/node";
import initCatalog from "./helpers/CatalogHelper";

const engineVersion = "1.5.0-dev-10";
const payload = { type: High5ExecutionPayloadType.JSON, data: "{}" };

initCatalog(engineVersion, "../../../../wave-nodes/build/catalog/bundle.js").then((catalog) => {
    const design = {
        node: catalog.UpperCaseAction,
        uuid: 1,
        inputs: [
            {
                name: "String",
                value: "lower-case-line",
            },
        ] as StreamNodeResolvedInputs[],
    };

    import("./index").then((module) => module.execute(engineVersion, payload, design).then((result) => console.info("done: ", result)));
});
