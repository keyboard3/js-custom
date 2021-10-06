
type PickArray<T extends unknown[]> = T extends (infer Ele)[] ? Ele : never;
type Stat = {
  /** chunk 总数 */
  chunkCount: number
  /** 模块的总数 */
  modulesCount: number
  /** 入口 chunk 的模块总数量 */
  modulesFirstChunk: number
  /** 所有 chunk 的所有模块总数，包含重复模块 */
  modulesIncludingDuplicates: number
  /** 平均每个 chunk 的包含的模块数量 */
  modulesPerChunk: number
  /** chunk 文件名大小映射 */
  fileSizes: { [key: string]: number }
}
type Options = {
  /** chunk 加载的路径前缀 */
  scriptSrcPrefix: string
  /** 是否启用 uglify-js 压缩结果 */
  minimize: boolean
  /** 添加输入文件的绝对文件名作为注释 */
  includeFilenames: boolean
  /** 声明库的名字 */
  library: string
  /** 将文件写入此目录（绝对路径） */
  outputDirectory: string
  /** 将第一个 chunk 写入到这个文件 */
  output: string
  /** 将其他 chunk 写入名为 chunkId 的文件加上 outputPostfix */
  outputPostfix: string
  /** JSONP 函数用来加载 chunk */
  outputJsonpFunction: string
  /** 模块可能的文件后缀名 */
  extensions: string[]
  /** 模块的检索路径数组 */
  paths: string[]
  /** 无用,运行时为 undefined */
  resolve: any
}
interface Chunk {
  id: number
  modules: { [key: Module["id"]]: "include" | "in-parent" }
  /** chunk 的入口模块 */
  context: Partial<Module>
  /** chunk 是那个 chunk 的 require.ensure 展开的 */
  parents: Chunk["id"][]
  /** 如果 chunk 中没有 include 模块则为 true */
  empty: boolean
  /** 用于检查内部模块重复的 chunk,指向已经存在的 chunk */
  equals: Chunk["id"]
}

interface ExpressionLocation {
  line: number
  column: number
}
interface ModuleSource {
  requires: Partial<RequireModuleSource>[]
  asyncs: Partial<RequireEnsureSource>[]
}
interface RequireModuleSource extends ExpressionLocation {
  id: number;//模块 id
  name: string //require(name)
  /** 表达式中名字在源码中的索引开始和结束位置 */
  nameRange: [number, number]
}
interface RequireEnsureSource extends ExpressionLocation, ModuleSource {
  /** 模块内异步 ensure 指向的 chunk */
  chunkId: Chunk["id"]
  /** 表达式中第一个参数(数组)在源码中的索引开始和结束位置 */
  namesRange: [number, number]//require([names])
}
interface Module extends RequireModuleSource, RequireEnsureSource {
  id: number
  /** 作为 chunk 的入口模块才有，其他模块没有 */
  chunkId: Chunk["id"]
  /** 被引用过 chunkId */
  chunks: Chunk["id"][]
  /** 模块内容 */
  source: string
  /** 模块被检索到的实际文件地址 */
  filename: string
}
interface SourceReplaceItem {
  from: number
  to: number
  /** chunkId 或者 moduleId */
  value: string
}