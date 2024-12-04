import hcloud from "hcloud-sdk";
import { DesignBuild, StreamResult } from "hcloud-sdk/lib/interfaces/high5/space/event/stream";
import { ExtendedHigh5ExecutionPackage, High5ExecutionPayload } from "hcloud-sdk/lib/interfaces/high5/space/execution";
import path from "path";
import { Design } from "./definitions/application/Design";
import { EngineManager } from "./helpers/EngineManager";
import { executeStream } from "./service/streamService";

const initCatalog = async (engineVersion: string, catalogPath: string) => {
    await new EngineManager(engineVersion).getEngine();
    const catalogModule = await import(catalogPath);
    const nodeModule = await import(path.join(path.resolve(__dirname), ".engine", "build", "nodes", "Node"));
    return new catalogModule.Catalog(nodeModule.default).nodeCatalog;
};

const execute = async (engineVersion: string, payload: High5ExecutionPayload, design: Design): Promise<StreamResult> => {
    const waveEngine = await new EngineManager(engineVersion).getEngine();
    console.log(design);
    const executionPackage = {
        design: {} as DesignBuild,
        payload,
        waveCatalogs: [],
        waveEngine,
        dry: false,
        hcl: new hcloud({ server: "" }),
        orgName: "TestOrganization",
        spaceName: "TestSpace",
        streamId: "0123456789abcdef01234567",
        secret: "some-secret",
    } as unknown as ExtendedHigh5ExecutionPackage;

    return await executeStream(executionPackage);
};

export { execute as default, initCatalog };
