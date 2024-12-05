import { High5ExecutionPatchLog, High5ExecutionPatchStatus } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import VerifyFileSignature from "./VerifyFileSignature";

interface IVerifyFileSignature {
    new (): VerifyFileSignature;
}

interface ExecutionState {
    status: High5ExecutionPatchStatus;
    logs: High5ExecutionPatchLog;
}

export declare interface Engine {
    run(): Promise<unknown>;
    runDev(...waveNodeFolder: string[]): Promise<unknown>;
    dry(): Promise<unknown>;
    getStatusAndLogs(): ExecutionState;
    cancelExecution(): void;
}

export const importEngine = (
    path: string
): Promise<{
    default: new (streamPackage: unknown, signatureVerificator?: IVerifyFileSignature, catalogPath?: string) => Engine;
}> => {
    return import(path);
};
