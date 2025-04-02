type SemVer = [number, number, number];
export declare function parse(
    s: string,
    options?: {
        strip?: boolean;
    }
): SemVer;
export declare function compare(s1: SemVer, s2: SemVer): number;
export {};
