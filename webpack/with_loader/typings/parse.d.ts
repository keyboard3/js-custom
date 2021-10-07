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
interface Dependency extends ExpressionLocation {
  id?: number//模块 id
  name: string //require(name) require: boolean
}

type RequireContextDependency = Dependency & {
  expressionRange?: ExprRange
  calleeRange?: ExprRange
  warn?: string
  require: boolean
  replace: readonly [ExprRange, string]
}

type CommonJsRequireDependency = Dependency & {
  expressionRange?: ExprRange
  valueRange?: ExprRange
  variable?: string
  append?: string
}

interface RequireEnsureDependencyBlock extends ExpressionLocation, ModuleDeps {
  /** 模块内异步块指向的 chunk */
  chunkId?: Chunk["id"]
  /** 表达式中第一个参数(数组)在源码中的索引开始和结束位置 */
  namesRange: ExprRange//require([names])
  blockRange?: ExprRange
  ignoreOverride: boolean
  overwrite: string[]
  options: Partial<Options>
}

interface ModuleDeps {
  requires: Partial<CommonJsRequireDependency>[]
  asyncs?: Partial<RequireEnsureDependencyBlock>[]
  contexts?: Partial<RequireContextDependency>[]
}