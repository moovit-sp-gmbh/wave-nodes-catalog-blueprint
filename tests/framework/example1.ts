import { addWaveNodeFolder, executeWithAllEngines } from ".";
import { High5ExecutionPayloadType } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import path from "path";

addWaveNodeFolder(path.resolve(path.join("..", "wave-nodes", "build", "catalog")));
const payload = { type: High5ExecutionPayloadType.JSON, data: "{}" };

const DESIGN = {
    node: "UpperCaseAction",
    uuid: 1,
    inputs: {
        String: "All Characters In This Line Will Be Converted To Lowercase.",
    },
    onSuccess: {
        node: "LowerCaseAction",
        uuid: 2,
        inputs: {
            String: "{{node.1.output.String}}",
        },
    },
};

executeWithAllEngines(payload, DESIGN).then((results) => {
    Object.keys(results).forEach((ver) => {
        console.info(`- Execution with engine ${ver} -> ${results[ver]}`);
    });
});
