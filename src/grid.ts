import { splitPathCode, toPath } from "./refs";

export function findRightmost(paths: string[]) {
    const [col, row] = paths.map(c => splitPathCode(c)).sort(([col, _row]) => -col)[0]
    console.log("PP", paths, paths.map(splitPathCode), col, row)
    return toPath(col, row)
}

export type Direction =
    | 'up'
    | 'down'
    | 'left'
    | 'right'

export function translate(path: string, dir: Direction) {
    let [col, row] = splitPathCode(path)

    switch (dir) {
        case 'right':
            col += 1
            break
        case 'left':
            col -= 1
            break
        case 'up':
            row -= 1
            break
        case 'down':
            row += 1
            break
    }

    return toPath(col, row)
}
