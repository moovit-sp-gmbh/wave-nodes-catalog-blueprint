# helmut.cloud catalog

This repository serves as a base for creating new node catalogs to be used in helmut.cloud stream designs.

## Constructing your catalog

### Catalog

Your catalog is defined using the Catalog constructor. The index.ts file should have a Catalog instance has its default export to allow the build scripts to function properly.

A Catalog consists of a name, description, logo, minimum required engine version and a series of nodes. Nodes are any class that extends the Node class.

#### Minimum required engine version

Any space using an older engine version than the one specified will not be able to execute streams with nodes from this catalog.

We intend to have a compatibility testing tool in the future, to easily check if there are incompatabilities between the catalog's nodes and any engine version.

### Node

Any class that extends the Node class is required to define its specification and its execution logic. Any packages can be used here as they will all be bundled with the source code when publishing.

### Cleaning up the sample HttpClient node

When you decide to remove the HttpClient node you should also cleanup its `axios` dependency. Keep in mind, that since the `hcloud-sdk` has it as a dependency it will stay in your `package-lock.json`.

    npm uninstall axios

## Testing your nodes

To test your nodes it is necessary to have a [helmut.cloud Agent](https://app.helmut.cloud/account/user/downloads) running locally. You should then go to [this URL](http://localhost:6968/api/agent/v1/modules/dev-wave/) and submit the root directory of this repository. Alternatively you can use the `link` command to do the same.

    npm run link

After that you will need to paste the node specification into the Stream Designer Studio. Press `cmd+k` which will cause a dialog to popup where you need to find `Import node specification`.

![Import node specification](./assets/import-node-spec.png)

The specification can be obtained by using the `spec` script and copying the JSON written to standard out. The `--silent` argument is important to prevent npm from writing to stdout if you want to pipe or redirect the command output.

    npm run --silent spec -- <name of your node>

### Debugging

To be able to step through the code of your nodes you will need to start up the agent via the `debug` script.

    npm run debug

This will launch a NodeJS process with the [--inspect flag](https://nodejs.org/en/learn/getting-started/debugging).

Any debug client can be used to attach to this NodeJS process, but the easiest way is to start it inside a [Javascript Debug Terminal in VSCode](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_javascript-debug-terminal). After starting the agent, it is still necessary to run the `link` script in another terminal to be able to debug your own nodes.

To keep iterating on your catalog with debug capabilities, use the `bundle:debug` script instead of the regular `bundle` script.

    npm run bundle:debug

In the future this process will become more streamlined as we improve the external catalog development experience.

## Publishing your catalog

Publishing your catalog will happen automatically whenever a new tag is pushed. A GitHub action is set to bundle the catalog and upload it to a specified S3 storage bucket. You will need to update the [upload-to-s3.yml](./.github/workflows/upload-to-s3.yaml) file to get the correct information for your S3 storage.

## Staying in sync

We recommend adding this repo as a remote so that you can make sure your catalog is up-to-date.

    git remote add blueprint https://github.com/moovit-sp-gmbh/wave-nodes-catalog-blueprint.git
    git fetch blueprint
    git rebase blueprint/main // You can also choose to merge instead of rebase

As long as you make no changes to the `Node` and `Catalog` classes merge/rebase conflicts should be minimal. Should you need to extend these classes in anyway we recommend creating new classes that extend them to avoid future conflicts. The `index.ts` file can export an instance of any class that extends `Catalog`.

# Development of Nodes

Each node should extend the abstract class Node.
The **specification** field and the **execute()** method are mandatory for implementation.
Additionally, this class contains a **wave** field that will be inserted at runtime and whose methods can be used to access and control the execution behavior of the current node.
This class should be exportable by default to be available for use from outside:

```typescript
export default class SomeAction extends Node {
    wave!: Wave; // This property will be inserted at runtime don't implement it
    specification: StreamNodeSpecificationV4 = { ... };
    execute(): Promise<void> { ... };
}
```

## Specification

The specification defines the basic metadata required to publish a node in the catalog.
Also, the input data that the node expects and the expected results that will be placed in the outputs should be described here.
For more details, you can view the components of the specification in the SDK:

```typescript
import { StreamNodeSpecificationV4 } from "hcloud-sdk/lib/interfaces/high5";
```

### Version of the specification

At this moment, version 4 of the node specification is relevant.
To specify this - please use the **specVersion** field:

```typescript
specification: StreamNodeSpecificationV4 = {
    specVersion: 4,
    ...
}
```

Compared to version 2, the specification gained the following:
- version 3 added the mandatory **deprecated** field (see [Deprecation](#deprecation));
- version 4 added [dependent input fields](#dependent-input-fields): every input can define an **if** condition that decides, based on the values of the other inputs, whether the input is shown in the Stream Designer Studio.

Everything else (name, description, category, version, author, tags, outputs, additional connectors, ...) works the same as in version 2.

### Deprecation

The **deprecated** field is mandatory since specification version 3. Set it to `true` to mark a node as deprecated, e.g. when it is replaced by a newer node:

```typescript
specification: StreamNodeSpecificationV4 = {
    ...
    deprecated: false,
    ...
}
```

### Name

In order to specify a name for the node - please use the **name** field.
This name will be used in the Stream Designer Studio and on other pages of the helmut.cloud:

```typescript
specification: StreamNodeSpecificationV4 = {
    name: "Prime numbers";
    ...
}
```

### Description

A more detailed description of the function performed by the current node should be placed in the **description** text field:

```typescript
specification: StreamNodeSpecificationV4 = {
    ...
    description: "Calculates a series of prime numbers up to the given position and returns the last value in this series";
    ...
}
```

### Node category

Please specify the **category** to which the current node will belong to:

```typescript
specification: StreamNodeSpecificationV4 = {
    ...
    category: "Math operations";
    ...
}
```

### Node version

The node version must be set according to the defined **StreamSemanticVersion** type.
This type includes the following fields:
- major - changes effecting the user and are not backwards compatible (parameter changes);
- minor - changes effecting the user but are backwards compatible (logic changes);
- patch - changes not effecting the user (bug fixes);
- changelog - array with descriptions for every change on the the node.

```typescript
import { StreamSemanticVersion } from "hcloud-sdk/lib/interfaces/high5";

specification: StreamNodeSpecificationV4 = {
    ...
    version: {
        major: 1,
        minor: 0,
        patch: 2,
        changelog: ["fixed a bug in the definition of prime numbers", "optimized the calculation algorithm"]
    } as StreamSemanticVersion;
    ...
}
```

### Author details

Information about the author must be specified according to the **StreamNodeSpecificationAuthor** type.
This type includes the following fields:
- name
- company
- email

```typescript
import { StreamNodeSpecificationAuthor } from "hcloud-sdk/lib/interfaces/high5";

specification: StreamNodeSpecificationV4 = {
    ...
    author: {
        name: "John Smith",
        company: "Acme Corp",
        email: "john.smith@acmecorp.com"
    } as StreamNodeSpecificationAuthor;
    ...
}
```

### Tags

You can specify an array of tags that must contain one of the listed values (this is an optional field of the specification):
- PREVIEW,
- EXPERIMENTAL.

```typescript
import { StreamNodeSpecificationTag } from "hcloud-sdk/lib/interfaces/high5";

specification: StreamNodeSpecificationV4 = {
    ...
    tag: [StreamNodeSpecificationTag.PREVIEW];
    ...
}
```

### Expected input data

The specification should describe in detail all the input data that are necessary for the operation of the node.
The description of each input parameter is an array element contained in the **inputs** field.
The input parameter details must match the **StreamNodeSpecificationInput** type which defined in the SDK:

```typescript
import { StreamNodeSpecificationInput } from "hcloud-sdk/lib/interfaces/high5";
```

#### Name of the input parameter

Each input parameter must have a name. This name will be used to access the value of the specified parameter.
It is recommended to define the names of all input parameters separately in the form of an exported enum, this will allow the verification of the name using built-in TypeScript tools. The specified enum must be available for import from outside so that it can be used in tests.

```typescript
export enum Input {
    PRIME_NUMBER_POSITION = "Prime number position",
}
...
inputs: [
    {
        name: Input.PRIME_NUMBER_POSITION,
        ...
    }
]
```

#### Description of the input parameter

Each input parameter should have a detailed **description** explaining what data is expected:

```typescript
description: "Specify the sequence number of the prime number to be returned"
```

#### Type of the input value

It is necessary to specify the valid type of the value of the input parameter.
The helmut.cloud describes a number of input data types that are defined in the SDK:

```typescript
import { StreamNodeSpecificationInputType } from "hcloud-sdk/lib/interfaces/high5";
```

The following input data types are available:
- STRING,
- STRING_LONG,
- STRING_LIST,
- STRING_MAP,
- STRING_READONLY,
- STRING_SELECT *,
- STRING_PASSWORD,
- NUMBER,
- BOOLEAN,
- ANY.

Note: for the **StreamNodeSpecificationInputType.STRING_SELECT** type, it is nesesary to specify an array of all possible values ​​in the **options** field (for other types, this field is ignored).

```typescript
type: StreamNodeSpecificationInputType.NUMBER,
```

#### Example of the input value

The **example** field is mandatory and must contain an example of a valid value for the specified parameter:

```typescript
example: 137
```

#### Default input value

It is possible to assign a default value for the specified parameter, this field is optional:

```typescript
defaultValue: 1
```

#### Other optional properties

Additionally, it is possible to specify whether this field is **mandatory** or **advanced**, use the boolean type here:

```typescript
mandatory: true,
advanced: false,
```

Where field **mandatory** means that the current input parameter is mandatory.
And the **advanced** field refers to the display of the current parameter in the user interface - it “hides” the input field in the nodes configuration panel under the advanced accordion.

#### Dependent input fields

Since specification version 4, every input can be a **dependent input**: an input that is only shown in the node configuration panel when the values of other inputs match a condition.
This lets a node show only the inputs that make sense for the current configuration, for example a request body only for HTTP methods that send one, or the credentials only for the selected authentication type.

Dependent inputs use the **StreamNodeSpecificationDependendInput** type, which adds an optional **if** field to a regular input. The condition is a **Query** object that is defined in the SDK:

```typescript
import { StreamNodeSpecificationDependendInput } from "hcloud-sdk/lib/interfaces/high5";
import { Query } from "hcloud-sdk/lib/interfaces/high5/wave/dependentInputs";
```

The keys of a query are the **names of other inputs** of the same node. Use the values of your `Input` enum as computed keys so that the names stay in sync. An input without an **if** field is always shown.

The sample HttpClient node shows the **Body** input only for methods that send a request body:

```typescript
{
    name: Input.BODY,
    description: "Enter the HTTP request body content",
    type: StreamNodeSpecificationInputType.STRING_LONG,
    example: '{ "userId": 123 }',
    if: {
        [Input.METHOD]: {
            $in: [HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH, HttpMethod.DELETE],
        },
    } as Query<{ [Input.METHOD]: HttpMethod }>,
} as StreamNodeSpecificationDependendInput,
```

The generic parameter of **Query** describes the inputs the condition refers to (input name → value type). It lets TypeScript check the operators and values you use.

##### Operators

A field condition is either a plain value (shorthand for `$eq`) or an object with one or more of these operators:

| Operator | Applies to | Matches when the input value ... |
| --- | --- | --- |
| `$eq`, `$ne` | any value | is equal / not equal to the given value |
| `$gt`, `$gte`, `$lt`, `$lte` | numbers, strings, dates | is greater than / greater or equal / less than / less or equal |
| `$in`, `$nin` | any value | is / is not one of the values in the given array |
| `$contains`, `$startsWith`, `$endsWith` | strings | contains / starts with / ends with the given text |
| `$regex` | strings | matches the given regular expression |
| `$exists` | any value | is set, i.e. not `null` / `undefined` (`$exists: true`) * |
| `$type` | any value | is of the given type: `"string"`, `"number"`, `"boolean"` or `"object"` |

\* `$exists: false` currently never matches. To check that an input is **not** set, negate the condition instead: `{ $not: { [Input.NAME]: { $exists: true } } }`. Apart from `$eq` and `$ne`, all operators fail when the input has no value.

Several operators in one field condition must all match. Conditions on several inputs in one query must also all match.

Conditions can be combined with the logical operators `$and`, `$or`, `$nor` (arrays of queries) and `$not` (a single query).

##### Examples

Show an input only when a boolean input is enabled:

```typescript
if: {
    [Input.USE_PROXY]: true,
} as Query<{ [Input.USE_PROXY]: boolean }>,
```

Show an input when a select input has a given value **or** another input is filled in:

```typescript
if: {
    $or: [
        { [Input.AUTHENTICATION]: "Basic" },
        { [Input.USERNAME]: { $exists: true, $ne: "" } },
    ],
} as Query<{ [Input.AUTHENTICATION]: string; [Input.USERNAME]: string }>,
```

Show an input only for a range of numbers:

```typescript
if: {
    [Input.RETRIES]: { $gt: 0, $lte: 10 },
} as Query<{ [Input.RETRIES]: number }>,
```

Hide an input for a given pattern by negating a condition. For example, an HTTP node could hide an SSL option for plain `http://` URLs. Negating the condition keeps the input visible for `https://` URLs and for URLs that are built from wildcards:

```typescript
if: {
    $not: {
        [Input.URL]: { $startsWith: "http://" },
    },
} as Query<{ [Input.URL]: string }>,
```

##### Things to keep in mind

- Do not rely on a hidden dependent input having a value. Treat it as optional in the **execute()** method and fall back to a sensible default, or only read it when the condition it depends on is met.
- The wave engine does not evaluate the **if** condition: a **mandatory** dependent input is still required at runtime, even while it is hidden. Only make a dependent input mandatory when it is always shown in configurations where the node can run.
- Conditions are evaluated in the Stream Designer Studio on the values entered there, not on the values that wildcards resolve to at runtime. Write conditions so that inputs containing wildcards still show the inputs that may be needed, as the `$not` example above does.
- The SDK provides **validateQuery** (`hcloud-sdk/lib/interfaces/high5/wave/dependentInputsValidation`) to check that a query is well formed and **matchesQuery** (`hcloud-sdk/lib/interfaces/high5/wave/dependentInputs`) to evaluate a query against a set of input values. Both are useful in unit tests.

### Outputs

The specification should describe in detail all the output data that will be returned by node after execution.
The description of each output parameter is an array element contained in the **outputs** field.
The output parameter details must match the **StreamNodeSpecificationOutputV2** type which defined in the SDK:

```typescript
import { StreamNodeSpecificationOutputV2 } from "hcloud-sdk/lib/interfaces/high5";
```

#### Name of the output parameter

Each output parameter must have a name. This name will be used to access the value of the specified parameter.
It is recommended to define the names of all output parameters separately in the form of an exported enum, this will allow the verification of the name using built-in TypeScript tools. The specified enum must be available for import from outside so that it can be used in tests.

```typescript
export enum Output {
    EXECUTION = "Execution",
    DURATION = "Run time",
}
...
outputs: [
    {
        name: Output.EXECUTION,
        ...
    }
]
```

#### Description of the output parameter

Each output parameter should have a detailed **description** explaining what data is expected:

```typescript
description: "Returns a prime number at the given ordinal number"
```

#### Type of the output value

It is necessary to specify the valid type of the value of the output parameter.
The helmut.cloud describes a number of output data types that are defined in the SDK:

```typescript
import { StreamNodeSpecificationOutputType } from "hcloud-sdk/lib/interfaces/high5";
```

The following output data types are available:
- STRING,
- STRING_LONG,
- STRING_LIST,
- STRING_MAP,
- STRING_READONLY,
- NUMBER,
- BOOLEAN,
- ANY,
- JSON,
- XML,
- HTML.

```typescript
type: StreamNodeSpecificationOutputType.NUMBER,
```

#### Example of the output value

The **example** field is mandatory and must contain an example of a valid value for the specified parameter:

```typescript
example: 773,
```

### Additional connectors

If necessary, you can specify a list of additional connectors (specification field **additionalConnectors** is optional). Each element of this array must be of type **StreamNodeSpecificationAdditionalConnector**.
This type is also defined in the SDK and contains only two fields:

```typescript
interface StreamNodeSpecificationAdditionalConnector {
    name: string;
    description: string;
}
```

### Node path

Optional field **path** can have a value of string type:

```typescript
path: "/temp",
```

### Custom node

Field **customNode** is also optional and should contain a value of type **StreamCustomNodeSpecification**, which is defined in the SDK:

```typescript
interface StreamCustomNodeSpecification {
    _id: string;
    color?: string;
}
```

## Wave node helper classes

As mentioned earlier, each node class has a **wave** property which will be inserted at runtime. This is an instance of the **Wave** class that provides access to the internal methods and properties of the node in a user friendly way. The helper methods are categorized into these classes:

- general,
- logger,
- inputs,
- outputs,
- fileAndFolderHelper,
- axiosHelper

For example, to retrieve the resolved input value of an input field, you can use the 'inputs' helper class:

```typescript
const filePath: string = this.wave.inputs.getInputValueByInputName(Input.FILE_PATH);
```

All these helper methods are implemented in the **Wave Engine** and properly documented via JsDoc comments.

## Implementation of the node logic

Apart from describing the node specification, it is also necessary to implement the **execute()** method, which will contain the main working logic of the node. This method does not expect any parameters and only returns a Promise<void>.
Using the helper class inputs, this method should obtain the expected input data, process it, and return the result to the user using the helper class outputs.

Take care that the node runs completely without exceptions to make it successful. The stream execution continues on the success output. Throw an exception if the node should fail. The stream execution continues on the fail output.

In case of an external cancelation it's the nodes developers responsibility to check on the 'isCanceled' state if he/she develops a node with higher execution duration time. Otherwise the stream execution will only stop if the execution of the current node is finished. You have to handle the cancel event in the node and throw a **StreamNodeGenericError** to cancel the stream if your node has a long running operation.

To calculate the time spent executing the node, start a timer at the beginning of the execute method and return the time difference at the end.

```typescript
async execute(): Promise<void> {
    // Start the timer to calculate the duration of execution
    const startTime = performance.now();

    // Read inputs
    const pos: number = this.wave.inputs.getInputValueByInputName(Input.PRIME_NUMBER_POSITION);

    // Check the correctness of incoming data
    if (pos <= 0) throw new Error("The position must be a positive number");

    // Data processing
    const result = await this.getPrimeNumberByPosition(pos);

    // Put result to outputs
    this.wave.outputs.setOutput(Output.EXECUTION, result);

    // Stop timer and set duration of execution
    this.wave.outputs.setOutput(Output.DURATION, performance.now() - startTime);
}
```
