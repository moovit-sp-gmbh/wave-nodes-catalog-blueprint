import type { NodeInputs } from "./Inputs";
import type { NodeConstructor } from "./NodeConstructor";

interface Design {
    node: NodeConstructor;
    uuid: number | string;
    inputs: NodeInputs;
    onSuccess?: Design;
}

export { Design };
