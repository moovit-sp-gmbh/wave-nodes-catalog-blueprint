import { StreamResult } from "hcloud-sdk/lib/interfaces/high5";
import { ExtendedHigh5ExecutionPackage } from "hcloud-sdk/lib/interfaces/high5/space/execution/index";
import { ExecutionState } from "./helpers/ExecutionStateHelper";
import StreamRunner, { AgentInfo } from "./utils/StreamRunner";
/**
 * Engine is the entrypoint for new stream executions
 */
export default class Engine extends StreamRunner {
    constructor(executionPackage: ExtendedHigh5ExecutionPackage, _?: unknown, catalogPath?: string, agentInfo?: AgentInfo);
    getStatusAndLogs(): ExecutionState;
    cancelExecution(): void;
    /**
     * Run a stream in dry mode
     * @returns StreamResult (Promise)
     */
    dry(): Promise<StreamResult>;
    /**
     * Run a stream
     * @returns StreamResult (Promise)
     */
    run(): Promise<StreamResult>;
    /**
     * Run a stream
     * @returns StreamResult (Promise)
     */
    runDev(...incomingWaveNodeFolder: string[]): Promise<StreamResult>;
}
