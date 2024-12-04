import { StreamResult } from "../models/StreamResult";
export default class WildcardResolver {
    private streamResult;
    private static MAX_WILDCARD_NESTINGS;
    constructor(streamResult: StreamResult);
    /**
     * resolve all wildcards
     */
    resolve(input: string): number | string;
    private processWildcard;
    private handleOutputWildcard;
    private handlePayloadWildcard;
    private handleStreamVariableWildcard;
    handleNodeWildcard(wildcard: string[], interrupt: () => void): unknown;
    handleStreamWildcard(wildcard: string[]): unknown;
    handleAgentWildcard(wildcard: string[]): unknown;
}
