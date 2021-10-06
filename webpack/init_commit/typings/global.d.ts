
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
interface DepTree {
  modules: { [key: Module["id"]]: Partial<Module> }
  chunks: { [key: Chunk["id"]]: Partial<Chunk> }
  modulesById: { [key: Module["id"]]: Partial<Module> }
  nextModuleId: Module["id"]
  nextChunkId: Chunk["id"]
  chunkModules: { [key: `${Module["id"]}...` & string]: Chunk["id"] }
}
interface Chunk {
  id: number
  modules: { [key: Module["id"]]: "include" | "in-parent" }
  context: Partial<Module>
  parents: Chunk["id"][]
  empty: boolean
  equals: Chunk["id"]
}

interface ExpressionLocation {
  line: number
  column: number
}
interface RequireModuleSource extends ExpressionLocation {
  name: string //require
  nameRange: [number, number]//require(name)
}
interface RequireEnsureSource extends ExpressionLocation {
  namesRange: [number, number]//require([names])
  requires: { name?: string }[]
  asyncs: Partial<RequireEnsureSource>[]
}
interface Module extends RequireModuleSource, RequireEnsureSource {
  id: number
  chunkId: Chunk["id"]
  chunks: Chunk["id"][]
  requires: Partial<Module>[]
  asyncs: Partial<Module>[]
  source: string
  filename: string
}
interface SourceReplaceItem {
  from: number
  to: number
  value: string
}