"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireFromHTTP = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const nodeCache = [];
const requireFromHTTP = async (url, token) => {
    return new Promise(function (resolve, reject) {
        const cache = nodeCache.find((c) => c.url === url);
        if (cache) {
            resolve(cache.body);
        } else {
            let client;
            if (url.startsWith("https://")) {
                client = https_1.default;
            } else {
                client = http_1.default;
            }
            const options = {
                headers: {
                    Authorization: token,
                },
            };
            client.get(url, options, (res) => {
                res.setEncoding("utf8");
                let data = "";
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    nodeCache.push({ url: url, body: data });
                    resolve(data);
                });
                res.on("error", (error) => {
                    reject(error);
                });
            });
        }
    });
};
exports.requireFromHTTP = requireFromHTTP;
