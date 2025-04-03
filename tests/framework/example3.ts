import { executeChain } from ".";
import { High5ExecutionPayloadType } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import path from "path";
import initCatalog from "./helpers/CatalogHelper";

const engineVersions = ["2.0.0-dev-1", "2.0.0-dev-7", "2.0.0-dev-12"];
const catalogPath = path.join("..", "..", "..", "..", "wave-nodes", "build", "catalog", "bundle.js");
const payload = { type: High5ExecutionPayloadType.JSON, data: "{}" };

(async () => {
    const catalog = await initCatalog(catalogPath);
    const design = {
        node: catalog.PythonAction,
        uuid: 1,
        inputs: {
            ["Path to the Python interpreter"]: "python3",
            Code: "from wonderwords import RandomWord as RW; print('Random words:', ', '.join([RW().word().capitalize() for i in range(10)]), end='.')",
            Dependencies: "wonderwords",
        },
        onSuccess: {
            node: catalog.UpperCaseAction,
            uuid: 2,
            inputs: {
                String: "{{node.1.output.Stdout}}",
            },
            onSuccess: {
                node: catalog.SleepAction,
                uuid: 3,
                inputs: {
                    ["Sleep Duration"]: 5000,
                },
                onSuccess: {
                    node: catalog.LowerCaseAction,
                    uuid: 4,
                    inputs: {
                        String: "{{node.2.output.String}}",
                    },
                },
            },
        },
    };

    return await executeChain(engineVersions, payload, design);
})().then(outputs => console.info("Nodes executed with following engine versions:", Object.keys(outputs).join(", ")));
