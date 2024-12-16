import {
    ExtendedHigh5ExecutionPackage,
    High5ExecutionPackage,
    High5ExecutionPayloadType,
} from "hcloud-sdk/lib/interfaces/high5/space/execution/index";
import type { StreamResult } from "engine/build/models/StreamResult";
import type { Design } from "../definitions/application/Design";
import type { NodeData } from "../definitions/application/StreamNode";
import ExecutionStateHelper from "engine/build/helpers/ExecutionStateHelper";
import type { StreamNodeOutput } from "engine/build/models/StreamNode";
import StreamRunner from "engine/build/utils/StreamRunner";
import Wave from "engine/build/helpers/Wave";
import { resolveInputs } from "../helpers/InputHelper";
import { patchEngine } from "./PatchEngine";

const parsePayload = (executionPackage: High5ExecutionPackage) => {
    let payloadData = undefined;
    switch (executionPackage.payload.type) {
        case High5ExecutionPayloadType.JSON:
            try {
                payloadData = JSON.parse(executionPackage.payload.data);
            } catch (error: unknown) {
                console.error(`Unable to parse payload to json - ${error}`);
                return null;
            }
            console.info("Successfully parsed payload to json");
            break;
        default:
            console.info("Successfully parsed payload to plain text");
            break;
    }
    return payloadData;
};

const executeStream = async (executionPackage: ExtendedHigh5ExecutionPackage, design: Design): Promise<StreamNodeOutput[]> => {
    // parse payload
    executionPackage.payload.data = parsePayload(executionPackage);

    const nodes: NodeData = {};
    const streamRunner = new StreamRunner(executionPackage as ExtendedHigh5ExecutionPackage);
    const executionStateHelper = new ExecutionStateHelper().init(executionPackage as ExtendedHigh5ExecutionPackage);

    while (design) {
        console.info("• Execute node:", design.node.name);
        const node = new design.node(executionPackage, {} as StreamResult, resolveInputs(design.inputs, nodes));
        node.setExecutionStateHelper(executionStateHelper);
        const wave = patchEngine(new Wave(node, streamRunner), executionPackage.waveEngine.version);
        node.setWave(wave);
        await node.run();
        nodes[String(design.uuid)] = { input: node.getInputs() || [], output: node.getOutputs() || [] };
        if (design?.onSuccess) {
            design = design.onSuccess;
        } else break;
    }

    return nodes[String(design.uuid)].output;
};

export { executeStream };
