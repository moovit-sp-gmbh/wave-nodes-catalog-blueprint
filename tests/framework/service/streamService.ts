import { StreamResult } from "hcloud-sdk/lib/interfaces/high5/space/event/stream";
import {
    ExtendedHigh5ExecutionPackage,
    High5ExecutionPackage,
    High5ExecutionPayloadType,
} from "hcloud-sdk/lib/interfaces/high5/space/execution";

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

export const executeStream = async (executionPackage: ExtendedHigh5ExecutionPackage): Promise<StreamResult> => {
    // parse payload
    executionPackage.payload.data = parsePayload(executionPackage);

    return {} as StreamResult;
};
