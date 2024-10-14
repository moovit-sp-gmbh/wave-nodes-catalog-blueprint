function checkClassProperties(node, context) {
    if (
        !node.body.filter(
            (property) =>
                property.type === "PropertyDefinition" &&
                property.key.name === "specification"
        ).length
    )
        context.report({
            node,
            message: `Node class '${node.parent.id.name}' should contain property 'specification'.`,
        });
    if (
        !node.body.filter(
            (property) =>
                property.type === "MethodDefinition" &&
                property.key.name === "execute"
        ).length
    )
        context.report({
            node,
            message: `Node class '${node.parent.id.name}' should contain method 'execute()'.`,
        });
}

function checkSpecificationProperty(node, context) {
    if (node.key.name === "specification" && node.parent.type === "ClassBody") {
        if (
            !(
                (node.static === false &&
                    node.computed === false &&
                    node.declare === false) ||
                node.override !== false
            )
        )
            context.report({
                node,
                message: `Property '${node.parent.parent.id.name}.specification' should not be static.`,
            });
    }
}

function checkExecuteMethod(node, context) {
    if (node.key.name === "execute" && node.parent.type === "ClassBody") {
        if (node.kind !== "method" || node.value.type !== "FunctionExpression")
            context.report({
                node,
                message: `'${node.parent.parent.id.name}.execute' should be method.`,
            });
        if (node.value.async !== true)
            context.report({
                node,
                message: `Method '${node.parent.parent.id.name}.execute' should be async.`,
            });
        if (node.value.params.length)
            context.report({
                node,
                message: `Method '${node.parent.parent.id.name}.execute' should not accept any parameters.`,
            });
        if (
            !(
                node.static === false &&
                node.computed === false &&
                node.override === false
            )
        )
            context.report({
                node,
                message: `Method '${node.parent.parent.id.name}.execute' should not be static.`,
            });
    }
}

export default {
    meta: {
        docs: {
            description: "Check properties of the Node",
            recommended: false,
        },
        fixable: "code",
    },
    create: function(context) {
        return {
            Program: (node) => {
                checkNodeFile(file, node, context);
            },
            ClassBody: (node) => {
                checkClassProperties(node, context);
                checkNodeClass(file, node, context);
            },
            PropertyDefinition: (node) => {
                checkSpecificationProperty(node, context);
            },
            MethodDefinition: (node) => {
                checkExecuteMethod(node, context);
            },
        };
    },
};
