"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
exports.compare = compare;
function parse(s, options) {
    const segments = s.split(".", 3);
    if (options?.strip) {
        const rgxRes = /^(\d+).*/.exec(segments[2]);
        if (rgxRes !== null) {
            segments[2] = rgxRes[1];
        }
    }
    const [v1, v2, v3] = segments;
    return [parseInt(v1), parseInt(v2), parseInt(v3)];
}
function parseInt(s) {
    const n = Number.parseInt(s);
    return Number.isNaN(n) ? 0 : n;
}
function compare(s1, s2) {
    let c = s1[0] - s2[0];
    if (c !== 0) return c;
    c = s1[1] - s2[1];
    if (c !== 0) return c;
    return s1[2] - s2[2];
}
