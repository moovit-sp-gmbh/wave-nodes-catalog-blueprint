import { DebugCommand } from "hcloud-sdk/lib/interfaces/high5";
import { StreamNode } from "hcloud-sdk/lib/interfaces/high5/space/execution";

export default class DebugClient {
    res: (c: DebugCommand) => void;
    rej: (e: Error) => void;
    __promise?: Promise<DebugCommand>;
    wait(timeout: number): Promise<DebugCommand>;
    continue(): void;
    stepForward(): void;
    stepBack(): void;
    setValue(uuid: string, key: string, value: unknown): void;
    replaceNode(node: StreamNode): void;
}
