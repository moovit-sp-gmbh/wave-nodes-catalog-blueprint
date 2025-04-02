import { NodeConstructor } from "../definitions/application/NodeConstructor";
import Node from "../engine/build/nodes/Node";

const initCatalog = async (catalogPath: string): Promise<Record<string, NodeConstructor>> => {
    const catalogModule = await import(catalogPath);
    return new catalogModule.Catalog(Node).nodeCatalog;
};

export { initCatalog as default };
