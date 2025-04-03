import { executeWithAllEngines } from ".";
import { High5ExecutionPayloadType } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import path from "path";
import initCatalog from "./helpers/CatalogHelper";

const catalogPath = path.join("..", "..", "..", "..", "wave-nodes", "build", "catalog", "bundle.js");
const payload = { type: High5ExecutionPayloadType.JSON, data: "{}" };

initCatalog(catalogPath).then(catalog => {
    const design = {
        node: catalog.UpperCaseAction,
        uuid: 1,
        inputs: {
            String: "All Characters In This Line Will Be Converted To Lowercase.",
        },
        onSuccess: {
            node: catalog.LowerCaseAction,
            uuid: 2,
            inputs: {
                String: "{{node.1.output.String}}",
            },
        },
    };

    executeWithAllEngines(payload, design).then(results => {
        Object.keys(results).forEach(ver => {
            console.info(`- Execution with engine ${ver} -> ${results[ver]}`);
        });
    });
});
