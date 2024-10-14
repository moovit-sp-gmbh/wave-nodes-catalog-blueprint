import fs from "fs";

let tag = process.argv[2];
tag = tag.startsWith("v") ? tag.slice(1) : tag;

let changelog;

try {
    const data = fs.readFileSync("changelog.json", "utf8");
    changelog = JSON.parse(data);
} catch (err) {
    console.error("Error reading changelog.json:", err.message);
    process.exit(1);
}

if (!Array.isArray(changelog) || changelog.length === 0) {
    console.error("Invalid changelog.json format.");
    process.exit(1);
}

const firstEntry = changelog[0];

const semverRegex = /^(\d+)\.(\d+)\.(\d+)$/;
if (!semverRegex.test(firstEntry.version)) {
    console.error(
        `Version ${firstEntry.version} in changelog.json is not a valid version number. Must be 'X.X.X'`
    );
    process.exit(1);
}

if (firstEntry.version !== tag) {
    console.error(
        "Changelog version and pushed tag don't match. You probably forgot to update the changelog"
    );
    process.exit(1);
}

if (isNaN(Date.parse(firstEntry.date))) {
    console.error(`Date ${firstEntry.date} is not in a valid format.`);
    process.exit(1);
}

const validTypes = [
    "Bug Fixes",
    "Features",
    "Code Refactoring",
    "Performance Improvements",
    "Miscellaneous Chores",
];

if (!Array.isArray(firstEntry.changes) || firstEntry.changes.length === 0) {
    console.error("No changes found in the first entry of changelog.json.");
    process.exit(1);
}

for (const change of firstEntry.changes) {
    if (!validTypes.includes(change.type)) {
        console.error(`Invalid change type: ${change.type}`);
        process.exit(1);
    }
}

console.log("Changelog validation passed.");
