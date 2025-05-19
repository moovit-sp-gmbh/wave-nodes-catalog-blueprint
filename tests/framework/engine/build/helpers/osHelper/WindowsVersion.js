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
exports.getWindowsVersion = getWindowsVersion;
const os_1 = __importDefault(require("os"));
const SemanticVersioningHelper = __importStar(require("./SemanticVersioningHelper"));
const VERSIONS = [
    { platform: "Windows XP", release: "NT 5.1", windowsBuild: 2600 },
    { platform: "Windows XP", release: "NT 5.2", windowsBuild: 3790 },
    { platform: "Windows Vista", release: "NT 6.0", windowsBuild: 6002 },
    { platform: "Windows 7", release: "NT 6.1", windowsBuild: 7601 },
    { platform: "Windows 8", release: "NT 6.2", windowsBuild: 9200 },
    { platform: "Windows 8.1", release: "NT 6.3", windowsBuild: 9600 },
    { platform: "Windows 10", release: "NT 10.0", windowsBuild: 10240 },
    { platform: "Windows 10", release: "1511", windowsBuild: 10586 },
    { platform: "Windows 10", release: "1607", windowsBuild: 14393 },
    { platform: "Windows 10", release: "1703", windowsBuild: 15063 },
    { platform: "Windows 10", release: "1709", windowsBuild: 16299 },
    { platform: "Windows 10", release: "1803", windowsBuild: 17134 },
    { platform: "Windows 10", release: "1809", windowsBuild: 17763 },
    { platform: "Windows 10", release: "1903", windowsBuild: 18362 },
    { platform: "Windows 10", release: "1909", windowsBuild: 18363 },
    { platform: "Windows 10", release: "2004", windowsBuild: 19041 },
    { platform: "Windows 10", release: "20H2", windowsBuild: 19042 },
    { platform: "Windows 10", release: "21H1", windowsBuild: 19043 },
    { platform: "Windows 10", release: "21H2", windowsBuild: 19044 },
    { platform: "Windows 10", release: "22H2", windowsBuild: 19045 },
    { platform: "Windows 11", release: "21H2", windowsBuild: 22000 },
    { platform: "Windows 11", release: "22H2", windowsBuild: 22621 },
    { platform: "Windows 11", release: "23H2", windowsBuild: 22631 },
    { platform: "Windows 11", release: "24H2", windowsBuild: 26100 },
];
function getWindowsVersion(release) {
    if (os_1.default.platform() !== "win32") {
        throw new Error(`Attempted to get Windows version on the ${os_1.default.platform()} platform.`);
    }
    const [, , windowsBuild] = SemanticVersioningHelper.parse(release ?? os_1.default.release());
    for (let i = VERSIONS.length - 1; i >= 0; --i) {
        const v = VERSIONS[i];
        const wv = v.windowsBuild;
        if (windowsBuild >= wv) {
            return {
                platform: v.platform,
                version: os_1.default.version().split(" ").slice(2).join(" "),
                release: v.release,
            };
        }
    }
    throw new Error(`Unrecognized release and version for Windows: ${os_1.default.release()} -- ${os_1.default.version()}`);
}
