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
exports.getMacOSVersion = getMacOSVersion;
const os_1 = __importDefault(require("os"));
const SemanticVersioningHelper = __importStar(require("./SemanticVersioningHelper"));
const VERSIONS = [
    { platform: "Mac OS X", version: "10.0", release: "Cheetah", darwinVersion: "1.3.1" },
    { platform: "Mac OS X", version: "10.1", release: "Puma", darwinVersion: "5.0.0" },
    { platform: "Mac OS X", version: "10.2", release: "Jaguar", darwinVersion: "6.0.0" },
    { platform: "Mac OS X", version: "10.3", release: "Panther", darwinVersion: "7.0.0" },
    { platform: "Mac OS X", version: "10.4", release: "Tiger", darwinVersion: "8.0.0" },
    { platform: "Mac OS X", version: "10.5", release: "Leopard", darwinVersion: "9.0.0" },
    { platform: "Mac OS X", version: "10.6", release: "Snow Leopard", darwinVersion: "10.0.0" },
    { platform: "Mac OS X", version: "10.7", release: "Lion", darwinVersion: "11.0.0" },
    { platform: "OS X", version: "10.8", release: "Mountain Lion", darwinVersion: "12.0.0" },
    { platform: "OS X", version: "10.9", release: "Mavericks", darwinVersion: "13.0.0" },
    { platform: "OS X", version: "10.10", release: "Yosemite", darwinVersion: "14.0.0" },
    { platform: "OS X", version: "10.11", release: "El Capitan", darwinVersion: "15.0.0" },
    { platform: "macOS", version: "10.12", release: "Sierra", darwinVersion: "16.0.0" },
    { platform: "macOS", version: "10.13", release: "High Sierra", darwinVersion: "17.0.0" },
    { platform: "macOS", version: "10.14", release: "Mojave", darwinVersion: "18.0.0" },
    { platform: "macOS", version: "10.15", release: "Catalina", darwinVersion: "19.0.0" },
    { platform: "macOS", version: "11", release: "Big Sur", darwinVersion: "20.0.0" },
    { platform: "macOS", version: "12", release: "Monterey", darwinVersion: "21.0.0" },
    { platform: "macOS", version: "13", release: "Ventura", darwinVersion: "22.0.0" },
    { platform: "macOS", version: "14", release: "Sonoma", darwinVersion: "23.0.0" },
    { platform: "macOS", version: "15", release: "Sequoia", darwinVersion: "24.0.0" },
];
function getMacOSVersion() {
    if (os_1.default.platform() !== "darwin") {
        throw new Error(`Attempted to get MacOS version on the ${os_1.default.platform()} platform.`);
    }
    const darwinRelease = SemanticVersioningHelper.parse(os_1.default.release());
    for (let i = VERSIONS.length - 1; i >= 0; --i) {
        const v = VERSIONS[i];
        const dv = SemanticVersioningHelper.parse(v.darwinVersion);
        if (SemanticVersioningHelper.compare(darwinRelease, dv) > 0) {
            return {
                platform: v.platform,
                version: v.version,
                release: v.release,
            };
        }
    }
    throw new Error(`Unrecognized release and version for MacOS: ${os_1.default.release()} -- ${os_1.default.version()}`);
}
