import fs from "fs/promises";
import chalk from "chalk";
import path from "path";

async function main() {
	const pkg = JSON.parse(await fs.readFile("./package.json"))
	const specVersion = pkg.catalogProperties.specVersion;
	if (specVersion <= 0 || isNaN(specVersion)) {
		console.error("Invalid specVersion", process.argv[2])
		process.exit(1)
	}
	console.log(`Building specification with spec version ${specVersion}`)

	const mod = await import(process.argv[2])

	const catalog = mod.default.default; // Need two defaults because this is a mjs file and the bundle has a non-ESM default export

	const spec = { nodes: [], specVersion };

	for (const [name, nodeCtor] of Object.entries(catalog.nodeCatalog)) {
		try {
			// @ts-ignore
			const node = new nodeCtor();
			const nodeSpec = node.specification;
			if (nodeSpec.specVersion === specVersion) {
				console.log(chalk.green(name))
				spec.nodes.push(
					Object.assign(nodeSpec, {
						path: `name://${name}`
					})
				);
			} else {
				console.warn(`${chalk.red(name)} specification version does not match. Need ${specVersion} has ${nodeSpec.specVersion}. Skipping`)
			}
		} catch (err) {
			console.error(err, name);
		}
	}
	if (spec.nodes.length === 0) {
		console.error("No nodes in the specification. Aborting")
		process.exit(1)
	}
	// Sort to make it easier to compare between catalog versions
	spec.nodes.sort((a, b) => a.name.localeCompare(b.name))

	await fs.writeFile(
		path.join("./specification.json"),
		JSON.stringify(spec)
	);
}

main();
