import { High5ExecutionPayloadType } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import initCatalog from "./helpers/CatalogHelper";

const engineVersion = "1.5.0";
const catalogPath = "../../../../wave-nodes/build/catalog/bundle.js";
const payload = { type: High5ExecutionPayloadType.JSON, data: "{}" };

initCatalog(engineVersion, catalogPath).then((catalog) => {
    const design = {
        node: catalog.PythonAction,
        uuid: 1,
        inputs: {
            ["Path to the Python interpreter"]: "python3",
            ["Code"]:
                "from wonderwords import RandomWord as RW; print('Random words:', ', '.join([RW().word().capitalize() for i in range(10)]), end='.')",
            ["Dependencies"]: ["wonderwords"],
        },
        onSuccess: {
            node: catalog.UpperCaseAction,
            uuid: 2,
            inputs: {
                ["String"]: "{{node.1.output.Standard output}}",
            },
        },
    };

    import("./index").then((module) => module.execute(engineVersion, payload, design));
});
