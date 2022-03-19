import { Literal, Record, String, Array, Static } from 'runtypes';

export type ICellData = {
  type: string
}

export type Cell = {
  contents: ICellData
}

export type Grid = {
  cells: (Cell | undefined)[][]
}

const refRegexp = /[A-Z]+\d+/

export const Ref = Record({
  type: String.withConstraint(s => s.length > 0 || "type was too short"),
  path: String.withConstraint(s => s.length >= 2 || 'path is too shortt')
              .withConstraint(s => refRegexp.test(s) || 'path does not match regexp')
})

export type RefT = Static<typeof Ref>

export const IdeaCell = Record({
  type: Literal('idea'),
  body: String.withConstraint(s => s.length < 280),
  extends: Array(Ref)
})

export type IdeaCellT = Static<typeof IdeaCell>
