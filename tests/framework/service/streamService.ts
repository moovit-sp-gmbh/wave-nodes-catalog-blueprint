import {
    ExtendedHigh5ExecutionPackage,
    High5ExecutionPackage,
    High5ExecutionPayloadType,
} from "hcloud-sdk/lib/interfaces/high5/space/execution/index";
import { Design } from "../definitions/application/Design";
import { StreamResult } from "engine/build/models/StreamResult";
import StreamRunner from "engine/build/utils/StreamRunner";
import Wave from "engine/build/helpers/Wave";

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

const executeNode = async (executionPackage: ExtendedHigh5ExecutionPackage, streamRunner: StreamRunner, design: Design) => {
    const node = new design.node(executionPackage, {} as StreamResult, design.inputs);
    node.setWave(new Wave(node, streamRunner));
    node.run();
    console.log("outputs: ", node.getOutputs());
    console.log("result: ", node.getStreamResult());
};

const executeStream = async (executionPackage: ExtendedHigh5ExecutionPackage, design: Design): Promise<StreamResult> => {
    // parse payload
    executionPackage.payload.data = parsePayload(executionPackage);

    const streamRunner = new StreamRunner(executionPackage as ExtendedHigh5ExecutionPackage);

    await executeNode(executionPackage, streamRunner, design);

    return {} as StreamResult;
};

export { executeStream };
