import type HCloud from "hcloud-sdk";
import type { StreamResult } from "hcloud-sdk/lib/interfaces/high5/space/event/stream";
import type { StreamNodeOutput } from "hcloud-sdk/lib/interfaces/high5/space/event/stream/node";
import type { StreamNodeSpecification, StreamNodeSpecificationInput } from "hcloud-sdk/lib/interfaces/high5/wave";

export default abstract class Node {
    public static _isWaveNode = true;
    wave!: WaveHelper; // This property will be inserted at runtime don't implement it
    abstract specification: StreamNodeSpecification
    abstract execute(): Promise<void>
}

export type WaveHelper = {
    general: General;
    logger: Logger;
    inputs: Inputs;
    outputs: Outputs;
}

type General = {
    getNodeUuid(): string;
    resolveValue(value: string): number | string;
    getNodeSpecification(): StreamNodeSpecification;
    cancelExecution(): void;
    isCanceled(): boolean;
    getHcloudClient(): HCloud;
    getOrgName(): string
    getSpaceName(): string
    setStreamMessage(message: string): void
}

type Logger = {
    getCurrentProgress(): number | undefined
    getCurrentMessage(): string | undefined
    updateProgress(progress: number): void
    updateMessage(message: string): void
    updateProgressAndMessage(progress: number, message: string): void
}

type Inputs = {
    getInputs(): StreamNodeResolvedInput[]
    getInputByName(inputName: string): StreamNodeResolvedInput | undefined
    getPreresolvedInputByName(inputName: string): StreamNodeSpecificationInput | undefined
    getInputValueByInputName(inputName: string): unknown
    getInputOriginalValueByInputName(inputName: string): unknown
}

type StreamNodeResolvedInput = {
    name: string;
    value: unknown;
    originalValue: unknown;
}


type Outputs = {
    getAllOutputs(): StreamNodeOutput[]
    getOutputByName(outputName: string): StreamNodeOutput | undefined
    getOutputValueByOutputName(outputName: string): unknown
    setOutput(name: string, value: unknown): void
    executeAdditionalConnector(connectorName: string): Promise<StreamResult | undefined>
}
