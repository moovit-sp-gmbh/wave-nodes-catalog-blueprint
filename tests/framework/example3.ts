import { addWaveNodeFolder, executeChain } from ".";
import { High5ExecutionPayloadType } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import path from "path";

const engineVersions = ["2.0.0-dev-26"];
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
        node: "UpperCaseAction",
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
                node: "LowerCaseAction",
                uuid: 4,
                inputs: {
                    String: "{{node.2.output.String}}",
                },
            },
        },
    },
};

executeChain(engineVersions, payload, DESIGN).then((outputs) =>
    console.info("Nodes executed with following engine versions:", Object.keys(outputs).join(", "))
);
