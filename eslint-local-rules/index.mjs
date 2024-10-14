import nodeAttributes from "./node-attributes.mjs"
import nodeSpecification from "./node-specification.mjs"

export default {
    meta: {
        name: "local-rules",
        version: "1.0.0"
    },
    configs: {
    },
    rules: {
        "node-attributes": nodeAttributes,
        "node-specification": nodeSpecification,
    },
    processors: {},
}
