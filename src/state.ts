import create from 'zustand'
import produce from 'immer'
import { Cell } from './types'
import { SelectionRect } from './rect'

export type Sheet = {
    origin: string,
    cells: {
        [cellRef: string]: Cell
    }
}

type SheetState = {
    sheet: Sheet,
    setCell: (ref: string, c: Cell) => void,
    setCells: (partialSheet: Sheet) => void,
    clearCell: (ref: string) => void,
    clearCells: (refs: string[]) => void,
}

type EditingModes =
  | 'normal'
  | 'select'
  | 'select-destination'
  | 'duplicate'
  | 'duplicate-as-reference'

type SheetEditorState = {
    selection: SelectionRect | undefined,
    yanked: SelectionRect | undefined,
    mode: EditingModes,
    cursor: {
        col: number,
        row: number
    },

    setCursor: (col: number, row: number) => void,
    setSelection: (rect: SelectionRect) => void,
    clearSelection: () => void
    setYanked: (rect: SelectionRect) => void,
    clearYanked: () => void,
    setMode: (mode: EditingModes) => void,
}

export const useSheet = create<SheetState>(set => ({
  sheet: {
      origin: 'A0',
      cells: {}
  },
  setCell: (ref, cell) => set(produce(state => {
      state.sheet.cells[ref] = cell
  })),
  setCells: (partialSheet) => set(produce(state => {
      for (let ref in partialSheet.cells) {
          state.sheet.cells[ref] = partialSheet.cells[ref]
      }
  })),
  clearCell: (ref) => set(produce(state => {
      delete state.sheet.cells[ref]
  })),
  clearCells: (refs) => set(produce(state => {
      for (let r of refs) {
          delete state.sheet.cells[r]
      }
  })),
}))


export const useSheetEditor = create<SheetEditorState>(set => ({
    selection: undefined,
    yanked: undefined,
    mode: 'normal',
    cursor: {
        row: 0,
        col: 0,
    },

    setCursor: (col, row) => set(produce(state => {
        state.cursor = {
            col,
            row
        }
    })),
    setMode: m => set(produce(state => {
        state.mode = m
    })),
    setSelection: r => set(produce(state => {
        state.selection = r
    })),
    clearSelection: () => set(produce(state => {
        state.selection = undefined
    })),
    setYanked: r => set(produce(state => {
        state.yanked= r
    })),
    clearYanked: () => set(produce(state => {
        state.yanked = undefined
    })),
}))
