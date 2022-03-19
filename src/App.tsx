import React, { ReactNode, useCallback } from 'react';
import { keycode, useButtonPressed, useButtonReleased } from 'use-control/lib';
import KEYS from 'use-control/lib/keys';
import './App.css';
import { findRightmost, translate } from './grid';
import { cell, resolveRef, splitPathCode, toPath } from './refs';
import { Cell, IdeaCell, IdeaCellT } from './types';

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
  children: ReactNode
}

function CellWrapper({children, selected, zoom}: CellWrapperProps) {
  const classes = ['cell-wrapper', selected && 'cell-wrapper--selected'].filter(s => s).reduce((s, acc) => acc + ' ' + String(s)) || ''
  return <td className={classes} style={{width: `${zoom}px`, height: `${zoom}px`}}>{children}</td>
}

const inputMap = {
  buttons: {
    right: [keycode(KEYS.right_arrow), keycode(KEYS.l)],
    left: [keycode(KEYS.left_arrow), keycode(KEYS.h)],
    up: [keycode(KEYS.up_arrow), keycode(KEYS.k)],
    down: [keycode(KEYS.down_arrow), keycode(KEYS.j)],
    shift: [keycode(KEYS.shift)]
  },
  axes: {}
}

type SelectionRect = {
  startCol: number,
  endCol: number,
  startRow: number,
  endRow: number
}

function rectContains(rect: SelectionRect, cellPath: string) {
  const [col, row] = splitPathCode(cellPath)

  if (col < rect.startCol) return false
  if (col > rect.endCol) return false
  if (row < rect.startRow) return false
  if (row > rect.endRow) return false

  return true
}


function App() {
  const cols = ['A', 'B', 'C', 'D', 'E']
  const rows = [0, 1, 2, 3, 4]
  const g = React.useMemo(() => ({
    cells: rows.map(r => cols.map(c => Math.random() < 0.3 ? cell(`${c}${r}`) : undefined))
  }), [])

  console.log("A0", splitPathCode("A0"))
  console.log("A1", resolveRef(g, { type: 'text', path: 'A1' }))

  const [zoom, setZoom] = React.useState(128)
  const [shiftHeld, setShiftHeld] = React.useState(false)

  const [cursor, setCursor] = React.useState([0, 0])
  const [selectionRect, setSelectionRect] = React.useState<SelectionRect | undefined>({ startCol:0, endCol: 0, startRow: 0, endRow: 0 })

  useButtonPressed(inputMap, 'shift', () => {
    setShiftHeld(true)
  })

  useButtonReleased(inputMap, 'shift', () => {
    setShiftHeld(false)
  })

  const onRight = useCallback(() => {
    setCursor([cursor[0] + 1, cursor[1]])

    if (selectionRect) {
      if (shiftHeld) {
        setSelectionRect({...selectionRect, startCol: selectionRect.startCol + 1, endCol: selectionRect.endCol + 1 })
      } else {
        setSelectionRect({...selectionRect, endCol: selectionRect.endCol + 1 })
      }
    }
  }, [selectionRect, cursor, setSelectionRect, setCursor, shiftHeld])

  useButtonPressed(inputMap, 'right', onRight)

  const onLeft = useCallback(() => {
    setCursor([cursor[0] - 1, cursor[1]])

    if (selectionRect) {
      if (shiftHeld) {
        setSelectionRect({...selectionRect, startCol: selectionRect.startCol - 1, endCol: selectionRect.endCol - 1 })
      } else {
        setSelectionRect({...selectionRect, endCol: selectionRect.endCol - 1 })
      }
    }
  }, [selectionRect, cursor, setSelectionRect, setCursor, shiftHeld])

  useButtonPressed(inputMap, 'left', onLeft)

  const onDown = useCallback(() => {
    setCursor([cursor[0], cursor[1] + 1])

    if (selectionRect) {
      if (shiftHeld) {
        setSelectionRect({...selectionRect, startRow: selectionRect.startRow + 1, endRow: selectionRect.endRow + 1 })
      } else {
        setSelectionRect({...selectionRect, endRow: selectionRect.endRow + 1 })
      }
    }
  }, [selectionRect, cursor, setSelectionRect, setCursor, shiftHeld])

  useButtonPressed(inputMap, 'down', onDown)

  const onUp = useCallback(() => {
    setCursor([cursor[0], cursor[1] - 1])

    if (selectionRect) {
      if (shiftHeld) {
        setSelectionRect({...selectionRect, startRow: selectionRect.startRow - 1, endRow: selectionRect.endRow - 1 })
      } else {
        setSelectionRect({...selectionRect, endRow: selectionRect.endRow - 1 })
      }
    }
  }, [selectionRect, cursor, setSelectionRect, setCursor, shiftHeld])

  useButtonPressed(inputMap, 'up', onUp)


  return (
    <div className="App">
      <button onClick={() => setZoom(zoom + 8)}>+</button>{zoom}<button onClick={() => setZoom(zoom - 8)}>-</button>
      <table>
        <thead>
          <tr><th></th> {cols.map(c => <th key={c}>{c}</th>)} </tr>
        </thead>
        <tbody>
          {rows.map(ir => <tr key={ir}>
            <td>{ir}</td>
            {cols.map((_, ic) => {
              const cell = g.cells[ir][ic]
                return <CellWrapper zoom={zoom} selected={!!selectionRect && rectContains(selectionRect, toPath(ic, ir))
} key={ic}>{cell && renderCell(cell, ic, ir, zoom)}</CellWrapper>
            })}
          </tr>)}
        </tbody>
      </table>

    </div>
  );
}

export default App;
