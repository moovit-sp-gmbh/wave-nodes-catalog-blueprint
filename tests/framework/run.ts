import { High5ExecutionPayloadType } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import type { Design } from "./definitions/application/Design";
import execute, { initCatalog } from "./index";

const engineVersion = "1.5.0-dev-10";
const payload = { type: High5ExecutionPayloadType.JSON, data: "{}" };
initCatalog(engineVersion, "../../../wave-nodes/build/catalog/bundle.js").then((catalog) => {
    const design = {
        node: catalog.UpperCaseAction,
        uuid: 1,
        inputs: [
            {
                name: "String",
                value: "lower-case-line",
            },
        ],
    } as unknown as Design;

    execute(engineVersion, payload, design).then((result) => console.info(result.nodeResults[0].outputs));
});
