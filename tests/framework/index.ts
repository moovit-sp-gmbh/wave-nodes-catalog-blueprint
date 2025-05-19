import { executeStream } from "./service/StreamService";
import hcloud from "hcloud-sdk";
import type { DesignBuild } from "hcloud-sdk/lib/interfaces/high5/space/event/stream";
import type { ExtendedHigh5ExecutionPackage, High5ExecutionPayload } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import type { Design } from "./definitions/application/Design";
import type { StreamNodeOutput } from "./engine/build/models/StreamNode";
import { EngineManager } from "./helpers/EngineManager";
export { addWaveNodeFolder } from "./utils/folders";

enum ExecutionResult {
    SUCCESS = "success",
    FAIL = "fail",
}

const execute = async (engineVersion: string, payload: High5ExecutionPayload, design: Design): Promise<StreamNodeOutput[]> => {
    const waveEngine = await new EngineManager(engineVersion).getEngine();
    const executionPackage = {
        design: { nodes: [], startNode: "0" } as DesignBuild,
        payload,
        waveCatalogs: [],
        waveEngine,
        dry: false,
        hcl: new hcloud({ server: "" }),
        orgName: "TestOrganization",
        spaceName: "TestSpace",
        streamId: "7".repeat(24),
        secret: "some-secret-line",
        info: { target: "o.hryshchenko+framework@moovit-sp.com" },
    } as unknown as ExtendedHigh5ExecutionPackage;

    console.info(`► Using Wave Engine ${waveEngine.version} ...`);
    return await executeStream(executionPackage, design);
};

const executeChain = async (
    engineVersions: string[],
    payload: High5ExecutionPayload,
    design: Design
): Promise<Record<string, StreamNodeOutput[]>> => {
    if (!engineVersions || !engineVersions.length) return {};
    const outputs: Record<string, StreamNodeOutput[]> = {};
    for await (const version of engineVersions) {
        outputs[version] = await execute(version, payload, design);
    }
    return outputs;
};

const executeWithAllEngines = async (payload: High5ExecutionPayload, design: Design): Promise<Record<string, ExecutionResult>> => {
    const engines: string[] = (await new EngineManager().getEnginesList()).map((engine) => engine.version);
    const results: Record<string, ExecutionResult> = {};
    for await (const engine of engines) {
        try {
            await execute(engine, payload, design);
            results[engine] = ExecutionResult.SUCCESS;
        } catch (err) {
            console.error(`An error occurred during execution: ${String(err)}`);
            results[engine] = ExecutionResult.FAIL;
        }
    }
    return Object.keys(results)
        .sort()
        .reduce((acc, key) => ({ ...acc, [key]: results[key] }), {});
};

export { execute, executeChain, executeWithAllEngines };
