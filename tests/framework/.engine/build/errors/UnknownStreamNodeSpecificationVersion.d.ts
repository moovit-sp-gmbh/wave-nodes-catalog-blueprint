import { StreamNodeSpecification } from "hcloud-sdk/lib/interfaces/high5";
export default class UnknownStreamNodeSpecificationVersion extends Error {
    constructor(version: number | StreamNodeSpecification);
}
