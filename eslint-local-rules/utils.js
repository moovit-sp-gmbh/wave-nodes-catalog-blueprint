import path from "path";

function getFile(context) {
    return path.parse(context.filename);
}

function isNodeImplementation(filePath) {
    return (
        filePath.includes("src/nodes/") &&
        !filePath.endsWith("ActionNode.ts") &&
        !filePath.endsWith("ConditionNode.ts") &&
        !filePath.endsWith("CustomNode.ts")
    );
}

module.exports = { getFile, isNodeImplementation };
