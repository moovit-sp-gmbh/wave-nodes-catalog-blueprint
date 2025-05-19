"use strict";
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              var desc = Object.getOwnPropertyDescriptor(m, k);
              if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                  desc = {
                      enumerable: true,
                      get: function () {
                          return m[k];
                      },
                  };
              }
              Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
          });
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? function (o, v) {
              Object.defineProperty(o, "default", { enumerable: true, value: v });
          }
        : function (o, v) {
              o["default"] = v;
          });
var __importStar =
    (this && this.__importStar) ||
    (function () {
        var ownKeys = function (o) {
            ownKeys =
                Object.getOwnPropertyNames ||
                function (o) {
                    var ar = [];
                    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
                    return ar;
                };
            return ownKeys(o);
        };
        return function (mod) {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null)
                for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
            __setModuleDefault(result, mod);
            return result;
        };
    })();
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODE_CATALOG_NAME = void 0;
exports.requireNodeByPath = requireNodeByPath;
const crypto_1 = __importDefault(require("crypto"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const require_from_string_1 = __importDefault(require("require-from-string"));
const StreamNodeErrors_1 = require("../errors/StreamNodeErrors");
const Node_1 = __importDefault(require("../nodes/Node"));
const RequireFromUrl_1 = require("./RequireFromUrl");
exports.NODE_CATALOG_NAME = Symbol("node catalog name");
async function requireNodeByPath(streamNode, catalogPath, isAdditionalConnector, extraCatalogLocations, authToken) {
    try {
        if (streamNode.path.startsWith("name://")) {
            const nodeName = streamNode.path.split("name://")[1];
            let catalog;
            if (extraCatalogLocations) {
                catalog = await searchExtraCatalogs(extraCatalogLocations, nodeName);
            }
            if (!catalog) {
                catalog = await fetchCatalog(streamNode, isAdditionalConnector, catalogPath);
            }
            const node = catalog.nodeCatalog[nodeName];
            if (Object.hasOwn(catalog, "name")) {
                node[exports.NODE_CATALOG_NAME] = catalog.name;
            } else {
                node[exports.NODE_CATALOG_NAME] = "default";
            }
            return node;
        } else if (streamNode.path.startsWith("http")) {
            const code = await (0, RequireFromUrl_1.requireFromHTTP)(streamNode.path, authToken);
            throwForInvalidCode(code, streamNode.path);
            const engineFolderPath = path_1.default.resolve(__dirname, `../`);
            const customNodePath = `${engineFolderPath}/nodes/custom/customNode/${crypto_1.default.randomUUID()}.js`;
            return (0, require_from_string_1.default)(code, customNodePath);
        } else {
            throw new StreamNodeErrors_1.StreamNodePathTypeNotImplementedError(new Error("Invalid nodePath type"), streamNode.path);
        }
    } catch (err) {
        if (err instanceof StreamNodeErrors_1.StreamNodeError) {
            throw err;
        }
        throw new StreamNodeErrors_1.StreamNodePathNotFoundError(err, streamNode.path);
    }
}
function throwForInvalidCode(code, path) {
    if (!code) {
        throw new StreamNodeErrors_1.StreamNodePathNotFoundError(new Error("Invalid nodePath type"), path);
    }
    let customError;
    try {
        customError = JSON.parse(code);
    } catch {
        return;
    }
    const errorCodeKeys = ["code", "error", "message"];
    if (errorCodeKeys.every((key) => Object.keys(customError).includes(key))) {
        throw new StreamNodeErrors_1.StreamNodeGenericError(new Error("Error getting custom node from URL:" + customError.message));
    }
}
async function exists(path) {
    try {
        await promises_1.default.stat(path);
        return true;
    } catch {
        return false;
    }
}
function calculateMD5(input) {
    const hash = crypto_1.default.createHash("md5");
    hash.update(input);
    return hash.digest("hex");
}
async function searchExtraCatalogs(extraCatalogLocations, nodeName) {
    for (const waveNodeFolder of extraCatalogLocations.filter((s) => s.length > 0)) {
        let catalogPath = path_1.default.join(waveNodeFolder, "src", "catalog.ts");
        if (!(await exists(catalogPath))) {
            catalogPath = path_1.default.join(waveNodeFolder, "bundle.js");
            if (!(await exists(catalogPath))) {
                continue;
            }
        }
        const catalog = await initCatalogModule(catalogPath, true);
        if (catalog.nodeCatalog[nodeName] !== undefined) {
            return catalog;
        }
    }
    return undefined;
}
async function fetchCatalog(streamNode, isAdditionalConnector = false, catalogRoot) {
    const md5Hash = calculateMD5(`${streamNode.catalog.url}${streamNode.catalog.version}`);
    let catalogPath;
    if (catalogRoot) {
        catalogPath = path_1.default.join(catalogRoot, md5Hash, "bundle.js");
    } else if (isAdditionalConnector) {
        catalogPath = path_1.default.resolve(__dirname, `bundle.js`);
    } else {
        catalogPath = path_1.default.resolve(__dirname, `../../../../catalogs/${md5Hash}/bundle.js`);
    }
    return initCatalogModule(catalogPath);
}
async function initCatalogModule(path, reload = false) {
    const completeCatalogPath = `${path}?engine=${Buffer.from(__dirname).toString("base64url")}`;
    if (reload) {
        delete require.cache[completeCatalogPath];
    }
    let m;
    if (require.cache[completeCatalogPath]) {
        m = require.cache[completeCatalogPath]?.exports;
    } else {
        m = await Promise.resolve(`${path}`).then((s) => __importStar(require(s)));
        require.cache[completeCatalogPath] = require.cache[path];
        delete require.cache[path];
    }
    if (m.Catalog !== undefined) {
        return new m.Catalog(Node_1.default);
    }
    if (m.default !== undefined && "nodeCatalog" in m.default) {
        const catalog = m.default;
        for (const [, v] of Object.entries(catalog.nodeCatalog)) {
            let curr = v;
            while (curr !== null) {
                const next = Object.getPrototypeOf(curr);
                if (next === Node_1.default) {
                    break;
                } else if (next._isWaveNode) {
                    Object.setPrototypeOf(curr, Node_1.default);
                    Object.setPrototypeOf(curr.prototype, Node_1.default.prototype);
                    break;
                }
                curr = next;
            }
        }
        return catalog;
    }
    throw new Error("unknown catalog module composition");
}
