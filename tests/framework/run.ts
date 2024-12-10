import { High5ExecutionPayloadType } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import type { StreamNodeResolvedInputs } from "hcloud-sdk/lib/interfaces/high5/space/event/stream/node";
import initCatalog from "./helpers/CatalogHelper";

const engineVersion = "1.5.0";
const catalogPath = "../../../../wave-nodes/build/catalog/bundle.js";
const payload = { type: High5ExecutionPayloadType.JSON, data: "{}" };

initCatalog(engineVersion, catalogPath).then((catalog) => {
    const design = {
        node: catalog.PythonAction,
        uuid: 1,
        inputs: [
            { name: "Path to the Python interpreter", value: "python3.10" },
            { name: "Code", value: "from datetime import datetime; print(datetime.now().isoformat())" },
            { name: "Dependencies", value: ["requests"] },
        ] as StreamNodeResolvedInputs[],
    };

    import("./index").then((module) => module.execute(engineVersion, payload, design).then((result) => console.info("done: ", result)));
});
