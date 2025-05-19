import { addWaveNodeFolder, executeChain } from ".";
import { High5ExecutionPayloadType } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import path from "path";

const engineVersions = ["2.0.0-dev-3", "2.0.0-dev-12", "2.0.0-dev-23"];
addWaveNodeFolder(path.resolve(path.join("..", "wave-nodes", "build", "catalog")));
const payload = { type: High5ExecutionPayloadType.JSON, data: "{}" };

const DESIGN = {
    node: "PythonAction",
    uuid: 1,
    inputs: {
        ["Path to the Python interpreter"]: "python3",
        Code: "from wonderwords import RandomWord as RW; print('Random words:', ', '.join([RW().word().capitalize() for i in range(10)]), end='.')",
        Dependencies: "wonderwords",
    },
    onSuccess: {
        node: "LowerCaseAction",
        uuid: 2,
        inputs: {
            String: "{{node.1.output.Stdout}}",
        },
        onSuccess: {
            node: "SleepAction",
            uuid: 3,
            inputs: {
                ["Sleep Duration"]: 5000,
            },
            onSuccess: {
                node: "UpperCaseAction",
                uuid: 4,
                inputs: {
                    String: "{{node.2.output.String}}",
                },
                /*onSuccess: {
                    node: "HttpClientAction",
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
                },*/
            },
        },
    },
};

executeChain(engineVersions, payload, DESIGN).then((outputs) => {
    Object.keys(outputs).forEach((ver) => {
        console.info(
            `- Execution duration with engine ${ver} = ${(outputs[ver].filter((k) => k.name === "Run time")[0].value / 1000).toFixed(1)} sec.`
        );
    });
});
