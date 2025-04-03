import { executeChain } from ".";
import { High5ExecutionPayloadType } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import path from "path";
import initCatalog from "./helpers/CatalogHelper";

const engineVersions = ["1.6.0", "2.0.0-dev-3", "2.0.0-dev-11"];
const catalogPath = path.join("..", "..", "..", "..", "wave-nodes", "build", "catalog", "bundle.js");
const payload = { type: High5ExecutionPayloadType.JSON, data: "{}" };

initCatalog(catalogPath).then(catalog => {
    const design = {
        node: catalog.PythonAction,
        uuid: 1,
        inputs: {
            ["Path to the Python interpreter"]: "python3",
            Code: "from wonderwords import RandomWord as RW; print('Random words:', ', '.join([RW().word().capitalize() for i in range(10)]), end='.')",
            Dependencies: "wonderwords",
        },
        onSuccess: {
            node: catalog.LowerCaseAction,
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
                    node: catalog.UpperCaseAction,
                    uuid: 4,
                    inputs: {
                        String: "{{node.2.output.String}}",
                    },
                    onSuccess: {
                        node: catalog.HttpClientAction,
                        uuid: 5,
                        inputs: {
                            URL: "https://httpbin.org/post",
                            Method: "POST",
                            Headers: { ["User-Agent"]: "Helmut.Cloud client", ["Content-Type"]: "plain/text" },
                            Body: "{{node.4.output.String}}",
                            ["Query Parameters"]: { helmut: "cloud", framework: "test" },
                            ["Fail on non-2XX Response"]: false,
                            ["Follow Redirects"]: false,
                            ["Ignore invalid SSL Certificate"]: false,
                            Timeout: 15,
                        },
                    },
                },
            },
        },
    };

    executeChain(engineVersions, payload, design).then(outputs => {
        Object.keys(outputs).forEach(ver => {
            console.info(`- Execution duration with engine ${ver} = ${(outputs[ver].filter(k => k.name === "Run time")[0].value / 1000).toFixed(1)} sec.`);
        });
    });
});
