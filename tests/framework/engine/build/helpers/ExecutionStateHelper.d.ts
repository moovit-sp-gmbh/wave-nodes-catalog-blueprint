import {
    ExtendedHigh5ExecutionPackage,
    High5ExecutionOutcome,
    High5ExecutionPatchLog,
    High5ExecutionPatchStatus,
    High5ExecutionState,
    StreamRunningNodePatch,
} from "hcloud-sdk/lib/interfaces/high5/space/execution/index";
import { StreamSingleNodeResult } from "../models/StreamSingleNodeResult";

export interface ExecutionState {
    status: High5ExecutionPatchStatus;
    logs: High5ExecutionPatchLog;
}
export default class ExecutionStateHelper {
    private streamId;
    private streamStatus;
    private streamLog;
    private executionPackage;
    private resetState;
    init(executionPackage: ExtendedHigh5ExecutionPackage): ExecutionStateHelper;
    getStatusAndLogs(): ExecutionState;
    updateStateAndOutcome(statusUpdate: { state?: High5ExecutionState; outcome?: High5ExecutionOutcome }): void;
    addRunningNode(node: StreamRunningNodePatch): void;
    removeRunningNode(nodeUuid: string): void;
    updateProgressAndMessage(
        runningNodeUpdate: {
            progress?: number;
            message?: string;
        },
        nodeUuid: string
    ): void;
    getRunningNode(nodeUuid: string): StreamRunningNodePatch | undefined;
    updateNodeResult(nodeResult: StreamSingleNodeResult): void;
    removeNodeResult(uuid: string): void;
    setNodeResults(nodeResults: StreamSingleNodeResult[]): void;
    cancelExecution(): void;
    getOutcome(): High5ExecutionOutcome | undefined;
    setStreamMessage(message: string): void;
    reportUnhandledError(err: any): void;
}
