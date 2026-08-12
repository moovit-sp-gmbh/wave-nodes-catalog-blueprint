import { StreamNodeSpecifications } from "hcloud-sdk/lib/interfaces/high5";
import type Node from "./Node";

export default class Catalog {
    name: string;
    description: string;
    logoUrl: string;
    minimumEngineVersion: string;
    nodes: (new () => Node)[];
    nodeCatalog: Record<string, new () => Node>;

    constructor(
        name: string,
        description: string,
        logoUrl: string,
        minimumEngineVersion: string,
        ...nodes: (new () => Node)[]
    ) {
        this.name = name;
        this.description = description;
        this.logoUrl = logoUrl;
        this.minimumEngineVersion = minimumEngineVersion;
        this.nodes = nodes;
        this.nodeCatalog = {};
        const versions: Record<string, string[]> = {};
        for (const node of nodes) {
            if (node.name in this.nodeCatalog) {
                throw new Error("two nodes with same class name");
            }
            const spec = new node().specification as StreamNodeSpecifications;
            const v = versions[spec.name] || (versions[spec.name] = []);
            const vStr = `${spec.version.major}.${spec.version.minor}.${spec.version.patch}`;
            if (v.includes(vStr)) {
                throw new Error(
                    `two nodes with name ${spec.name} and version ${vStr}`
                );
            } else {
                v.push(vStr);
            }
            this.nodeCatalog[node.name] = node;
        }
    }
}
