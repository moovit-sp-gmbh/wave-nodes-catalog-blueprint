import { High5ExecutionPayloadType } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import initCatalog from "./helpers/CatalogHelper";

const engineVersion = "2.0.0-dev-11";
const catalogPath = "../../../../wave-nodes/build/catalog/bundle.js";
const payload = { type: High5ExecutionPayloadType.JSON, data: "{}" };

initCatalog(engineVersion, catalogPath).then(catalog => {
    const design = {
        node: catalog.Python,
        uuid: 1,
        inputs: {
            ["Path to the Python interpreter"]: "python3",
            ["Code"]: "from wonderwords import RandomWord as RW; print('Random words:', ', '.join([RW().word().capitalize() for i in range(10)]), end='.')",
            ["Dependencies"]: "wonderwords",
        },
        onSuccess: {
            node: catalog.UpperCase,
            uuid: 2,
            inputs: {
                ["String"]: "{{node.1.output.Stdout}}",
            },
            onSuccess: {
                node: catalog.Sleep,
                uuid: 3,
                inputs: {
                    ["Sleep Duration"]: 5,
                },
                onSuccess: {
                    node: catalog.LowerCase,
                    uuid: 4,
                    inputs: {
                        ["String"]: "{{node.2.output.String}}",
                    },
                },
            },
        },
    };

    import("./index").then(module => module.execute(engineVersion, payload, design).then(outputs => console.info(outputs)));
});
