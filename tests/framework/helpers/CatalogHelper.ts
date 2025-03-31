import path from "path";
import { NodeConstructor } from "../definitions/application/NodeConstructor";
import { EngineManager } from "./EngineManager";

const initCatalog = async (engineVersion: string, catalogPath: string): Promise<Record<string, NodeConstructor>> => {
    await new EngineManager(engineVersion).getEngine();
    const catalogModule = await import(catalogPath);
    const nodeModule = await import(path.join("..", "engine", "build", "nodes", "Node"));
    return new catalogModule.Catalog(nodeModule.default).nodeCatalog;
};

export { initCatalog as default };
