type ExprRange = readonly [number, number]
interface ExpressionLocation {
  line: number
  column: number
}
interface ParseExpressionResult {
  range?: ExprRange
  value: string
  code?: boolean
  conditional?: ParseExpressionResult[]
}
interface RequireModuleSource extends ExpressionLocation {
  id?: number//模块 id
  name: string //require(name) require: boolean
}
interface RequireValueModuleSource extends RequireModuleSource {
  valueRange: ExprRange
}
interface RequireCalleeModuleSource extends RequireModuleSource {
  replace?: readonly [ExprRange, string]
  require?: boolean
  calleeRange: ExprRange
}
interface RequireExpressionModuleSource extends RequireModuleSource {
  expressionRange: ExprRange
}
interface RequireUnKnowModuleSource extends RequireModuleSource {
  variable: string
  append: string
}

interface RequireEnsureSource extends ExpressionLocation, ModuleSource {
  /** 模块内异步 ensure 指向的 chunk */
  chunkId?: Chunk["id"]
  /** 表达式中第一个参数(数组)在源码中的索引开始和结束位置 */
  namesRange: ExprRange//require([names])
  blockRange?: ExprRange
  ignoreOverride: boolean
  overwrite: string[]
  options: Partial<Options>
}