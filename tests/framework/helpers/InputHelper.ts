import { StreamNodeResolvedInputs } from "hcloud-sdk/lib/interfaces/high5";
import type { NodeInputs } from "../definitions/application/Inputs";

const resolveInputs = (inputs: NodeInputs): StreamNodeResolvedInputs[] => {
    const res: StreamNodeResolvedInputs[] = [];
    for (const key in inputs) {
        // eslint-disable-next-line no-prototype-builtins
        if (inputs.hasOwnProperty(key)) {
            res.push({ name: key, value: inputs[key] } as StreamNodeResolvedInputs);
        }
    }
    return res;
};

export { resolveInputs };
