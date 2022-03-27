import { splitPathCode, toPath } from "./refs";

export function findRightmost(paths: string[]) {
    const [col, row] = paths.map(c => splitPathCode(c)).sort(([col, _row]) => -col)[0]
    console.log("PP", paths, paths.map(splitPathCode), col, row)
    return toPath(col, row)
}

export function translate(path: string, cols: number, rows: number) {
    let [col, row] = splitPathCode(path)
    return toPath(col + cols, row + rows)
}
