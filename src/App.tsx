import React, { ReactNode, useCallback, useEffect } from 'react';
import { keycode, useButtonPressed, useButtonReleased } from 'use-control/lib';
import KEYS from 'use-control/lib/keys';
import './App.css';
import { getSelectedCells, rectContains, resizeRect, translateRect, translateSheet } from './rect';
import { cell, splitPathCode, toPath } from './refs';
import { useSheet, useSheetEditor } from './state';
import { Cell, IdeaCell, IdeaCellT } from './types';
import { getSubsheet } from './rect'

function IdeaCellView({ path, cell, zoom }: { path: string, cell: IdeaCellT, zoom: number }) {
  return <div style={{backgroundColor: '#7e57c2', textAlign: 'left', verticalAlign: 'top', height: '100%', padding: '4px', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '12px'}}>
    <strong>{path}{zoom > 80 && ' (idea)'}</strong><br />
    {zoom > 32 && <span>{cell.body}<br /></span>}

    {zoom > 48 && JSON.stringify(cell.extends.map(e => e.path))}
  </div>
}

function renderCell(cell: Cell, col: number, row: number, zoom: number) {
  if (!cell.contents) return
  const path = toPath(col, row)

  if (IdeaCell.guard(cell.contents)) {
      return <IdeaCellView cell={cell.contents} path={path} zoom={zoom} />
  }
}


type CellWrapperProps = {
  zoom: number
  selected: boolean
  cursor: boolean
  children: ReactNode
}

function CellWrapper({children, selected, cursor, zoom}: CellWrapperProps) {
  const classes = ['cell-wrapper', selected && 'cell-wrapper--selected', cursor && 'cell-wrapper--cursor'].filter(s => s).reduce((s, acc) => acc + ' ' + String(s)) || ''
  return <td className={classes} style={{width: `${zoom}px`, height: `${zoom}px`}}>{children}</td>
}

const inputMap = {
  buttons: {
    right: [keycode(KEYS.right_arrow), keycode(KEYS.l)],
    left: [keycode(KEYS.left_arrow), keycode(KEYS.h)],
    up: [keycode(KEYS.up_arrow), keycode(KEYS.k)],
    down: [keycode(KEYS.down_arrow), keycode(KEYS.j)],
    shift: [keycode(KEYS.shift)],
    select: [keycode(KEYS.s), keycode(KEYS.v)],
    delete: [keycode(KEYS.d)],
    move: [keycode(KEYS.m)],
    confirm: [keycode(KEYS.enter)],
    paste: [keycode(KEYS.p)],
    exit: [keycode(KEYS.escape), keycode(KEYS.space), keycode(KEYS.q)]
  },
  axes: {}
}



function App() {
  const size = 16
  const cols = [...Array(size)].map((_, i) => String.fromCharCode('A'.charCodeAt(0) + i))
  const rows = [...Array(size)].map((_, i) => i)

  const cursor = useSheetEditor(ed => ed.cursor)
  const setCursor = useSheetEditor(ed => ed.setCursor)
  const mode = useSheetEditor(ed => ed.mode)
  const setMode = useSheetEditor(ed => ed.setMode)
  const selection = useSheetEditor(ed => ed.selection)
  const setSelection = useSheetEditor(ed => ed.setSelection)
  const yanked = useSheetEditor(ed => ed.yanked)
  const setYanked = useSheetEditor(ed => ed.setYanked)
  const clearYanked = useSheetEditor(ed => ed.clearYanked)

  const sheet = useSheet(s => s.sheet)
  const setCell = useSheet(s => s.setCell)
  const setCells = useSheet(s => s.setCells)
    /* const clearCell = useSheet(s => s.clearCell) */
  const clearCells = useSheet(s => s.clearCells)

  useEffect(() => {
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (Math.random() < 0.3) {
          setCell(toPath(x, y), cell(`[${x} ${y}]`))
        }
      }
    }
  }, [setCell])

  const [zoom, setZoom] = React.useState(128)
  const [shiftHeld, setShiftHeld] = React.useState(false)


  useButtonPressed(inputMap, 'shift', () => {
    setShiftHeld(true)
  })

  useButtonReleased(inputMap, 'shift', () => {
    setShiftHeld(false)
  })

  useButtonPressed(inputMap, 'select', () => {
    if (mode !== 'normal') return

    setSelection({ startCol: cursor.col, endCol: cursor.col, startRow: cursor.row, endRow: cursor.row })
    setMode('select')
  })

  useButtonPressed(inputMap, 'exit', () => {
    if (mode === 'normal') return

    setMode('normal')
  })

  useButtonPressed(inputMap, 'delete', () => {
    if (mode !== 'select' || !selection) return

    const cells = getSelectedCells(selection)
    clearCells(cells)
  })

  useButtonPressed(inputMap, 'move', () => {
    if (mode !== 'select' || !selection) return

    setYanked({...selection})
    setMode('select-destination')
  })

  useButtonPressed(inputMap, 'confirm', () => {
    if (mode !== 'select-destination' || !yanked) return
    debugger

    let s = getSubsheet(sheet, yanked)
    let [oCol, oRow] = splitPathCode(s.origin)

    s = translateSheet(s, cursor.col - oCol, cursor.row - oRow)
    setCells(s)

    setMode('select-destination')
    clearYanked()
  })


  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
        ev.preventDefault()
    }

    document.addEventListener('keydown', onKey)

    return () => {
        document.removeEventListener('keydown', onKey)
    }
  }, [])

  const onMove = useCallback((dCols: number, dRows: number) => {
    const isSelecting = mode === 'select' || mode === 'select-destination'
    if (isSelecting && selection) {
      if (shiftHeld && mode === 'select') {
        setSelection(resizeRect(selection, dCols, dRows))
      } else {
        setSelection(translateRect(selection, dCols, dRows))
        setCursor(cursor.col + dCols, cursor.row + dRows)
      }
    } else {
      setCursor(cursor.col + dCols, cursor.row + dRows)
    }
  }, [selection, mode, cursor, setSelection, shiftHeld, setCursor])

  const onRight = useCallback(() => onMove(1, 0), [onMove])
  const onLeft = useCallback(() => onMove(-1, 0), [onMove])
  const onUp = useCallback(() => onMove(0, -1), [onMove])
  const onDown = useCallback(() => onMove(0, 1), [onMove])

  useButtonPressed(inputMap, 'right', onRight)
  useButtonPressed(inputMap, 'left', onLeft)
  useButtonPressed(inputMap, 'up', onUp)
  useButtonPressed(inputMap, 'down', onDown)

  return (
    <div className="App">
      <button onClick={() => setZoom(zoom + 8)}>+</button>{zoom}<button onClick={() => setZoom(zoom - 8)}>-</button>
      {mode}
      <table>
        <thead>
          <tr><th></th> {cols.map(c => <th key={c}>{c}</th>)} </tr>
        </thead>
        <tbody>
          {rows.map(ir => <tr key={ir}>
            <td>{ir}</td>
            {cols.map((_, ic) => {
              const cell = sheet.cells[toPath(ic, ir)]
              const selected = mode === 'select' && !!selection && rectContains(selection, toPath(ic, ir))
              const cursorOver = ic === cursor.col && ir === cursor.row

              return <CellWrapper zoom={zoom} cursor={cursorOver} selected={selected} key={ic}>{cell && renderCell(cell, ic, ir, zoom)}</CellWrapper>
            })}
          </tr>)}
        </tbody>
      </table>

    </div>
  );
}

export default App;
