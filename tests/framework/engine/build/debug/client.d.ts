import { IssuedDebugCommand } from "hcloud-sdk/lib/interfaces/high5";
import { StreamNode } from "hcloud-sdk/lib/interfaces/high5/space/execution";

export default class DebugClient {
    res: (c: IssuedDebugCommand) => void;
    rej: (e: Error) => void;
    __promise?: Promise<IssuedDebugCommand>;
    wait(timeout: number): Promise<IssuedDebugCommand>;
    continue(): void;
    stepForward(): void;
    stepBack(): void;
    setValue(uuid: string, key: string, value: unknown): void;
    replaceNode(node: StreamNode): void;
    restart(): void;
}
