import { Grid, Ref, RefT } from "./types";

export function toPath(col: number, row: number) {
  return String.fromCharCode('A'.charCodeAt(0) + col) + String(row)
}

export function splitPathCode(path: string) {
  let i = 0;
  let colCode = ''
  let rowCode = ''
  while (i < path.length) {
    if (isNaN(path[i] as any)) {
      colCode += path[i]
    } else {
      rowCode += path[i]
    }
    i++;
  }

  let column = 0
  let origin = 'A'.charCodeAt(0)
  for (let i = 0; i < colCode.length; i++) {
    column += colCode.charCodeAt(i) - origin
  }

  let row = Number(rowCode)

  return [column, row]
}

export function resolveRef(grid: Grid, ref: RefT) {
  try {
    Ref.check(ref);
  } catch (e) {
    console.error(e)
    return
  }

  const { path } = ref;
  const [x, y] = splitPathCode(path)

  return grid.cells[y][x]
}

export function ref(path: string, type: string) {
  return {
    path,
    type
  }
}

export function cell(t: string) {
  return {
    contents: {
      type: 'idea',
      body: t,
      extends: [ref('A0', 'idea')]
    }
  }
}
