import { translate } from "./grid"
import { splitPathCode, toPath } from "./refs"
import { Sheet } from "./state"

export type SelectionRect = {
  startCol: number,
  endCol: number,
  startRow: number,
  endRow: number
}

export function translateRect(rect: SelectionRect, dCols: number, dRows: number): SelectionRect {
  dCols = Math.round(dCols)
  dRows = Math.round(dRows)

  return {
    startCol: rect.startCol + dCols,
    endCol: rect.endCol + dCols,
    startRow: rect.startRow + dRows,
    endRow: rect.endRow + dRows,
  }
}

export function getSelectedCells(rect: SelectionRect) {
  const res = []
  for (let x = rect.startCol; x <= rect.endCol; x++) {
    for (let y = rect.startRow; y <= rect.endRow; y++) {
      res.push([x, y])
    }
  }

  return res.map(([x, y]) => toPath(x, y))
}

export function getSubsheet(sheet: Sheet, selection: SelectionRect) {
    const cells = getSelectedCells(selection)

    const subsheet: Sheet = { origin: toPath(selection.startCol, selection.startRow), cells: {}}
    for (let cell of cells) {
        subsheet.cells[cell] = sheet.cells[cell]
    }

    return subsheet
}

export function translateSheet(sheet: Sheet, cols: number, rows: number) {
    const newSheet: Sheet = { origin: translate(sheet.origin, cols, rows), cells: {} }
    for (let cell in sheet.cells) {
        const newRef = translate(cell, cols, rows)
        newSheet.cells[newRef] = sheet.cells[cell]
        console.log(cell, newRef)
    }

    return newSheet
}

export function resizeRect(rect: SelectionRect, dCols: number, dRows: number): SelectionRect {
  dRows = Math.round(dRows)

  return {
    ...rect,
    endCol: rect.endCol + dCols,
    endRow: rect.endRow + dRows,
  }
}

export function rectContains(rect: SelectionRect, cellPath: string) {
  const [col, row] = splitPathCode(cellPath)

  if (col < rect.startCol) return false
  if (col > rect.endCol) return false
  if (row < rect.startRow) return false
  if (row > rect.endRow) return false

  return true
}
