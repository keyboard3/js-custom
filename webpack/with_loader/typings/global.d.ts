
type PickArray<T extends unknown[]> = T extends (infer Ele)[] ? Ele : never;
type Stat = {
  hash: string
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
  warnings: string[]
  errors: string[]
  fileModules: { [key: string]: Partial<Module & ContextModule>[] }
}
type PackageJson = {
  webpackLoader: string
  webpack: string
  browserify: string
  main: string
}
type ResolveType = "loader" | "context" | "normal"
type Resolve = {
  loaders: { test: RegExp, loader: string }[]
  extensions: string[]
  paths: string[]
  alias: { [key: string]: string }
}
type Overwrite = {
  require: boolean
  process: string
  module: string
  console: string
  global: string
  Buffer: string
  "__dirname": string
  "__filename": string
}
type Parse = {
  require?: boolean
  overwrites: Partial<Overwrite>
}
type Options = Resolve & {
  /** chunk 加载的路径前缀 */
  scriptSrcPrefix: string
  /** 是否启用 uglify-js 压缩结果 */
  minimize: boolean
  /** 添加输入文件的绝对文件名作为注释 */
  includeFilenames: boolean
  /** todo */
  debug: boolean
  /** todo */
  watch: boolean
  /** todo  */
  events: any
  /** 声明库的名字 */
  library: string
  /** 将文件写入此目录（绝对路径） */
  outputDirectory: string
  loaderPostfixes: string[]
  postfixes: string[]
  /** 将第一个 chunk 写入到这个文件 */
  output: string
  /** 将其他 chunk 写入名为 chunkId 的文件加上 outputPostfix */
  outputPostfix: string
  /** JSONP 函数用来加载 chunk */
  outputJsonpFunction: string
  /** todo */
  parse: Partial<Parse>
  loaderExtensions: string[]
  /** todo  */
  resolve: Partial<Resolve>
}
type Reason = {
  type: "main" | "require" | "async require" | "context" | "async context"
  count?: number
  filename?: string
}
interface DepTree {
  warnings: string[]
  errors: string[]
  modules: DepTree["modulesByFile"]
  modulesByFile: { [key: Module["filename"]]: Partial<Module & ContextModule> }
  modulesById: { [key: Module["id"]]: Partial<Module & ContextModule> }
  chunks: { [key: Chunk["id"]]: Partial<Chunk> }
  nextModuleId: Module["id"]
  nextChunkId: Chunk["id"]
  /** 用于检查内部模块重复的 chunk, key: id... */
  chunkModules: { [key: string]: Chunk["id"] }
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

interface ModuleSource {
  requires: Partial<RequireValueModuleSource | RequireExpressionModuleSource | RequireUnKnowModuleSource>[]
  asyncs?: Partial<RequireEnsureSource>[]
  contexts?: Partial<RequireCalleeModuleSource | RequireExpressionModuleSource>[]
}

interface Module extends RequireModuleSource, RequireEnsureSource {
  id: number
  realId: number
  /** 作为 chunk 的入口模块才有，其他模块没有 */
  chunkId: Chunk["id"]
  /** 被引用过 chunkId */
  chunks: Chunk["id"][]
  /** 模块内容 */
  source: string
  /** 模块被检索到的实际文件地址 */
  filename: string
  reasons: Reason[]
  usages: number
  size: number
}
interface ContextModule extends RequireModuleSource, RequireEnsureSource {
  id: number
  dirname: string
  reasons: Reason[]
  requireMap: { [key: Module["filename"]]: Module["id"] }
}
interface SourceReplaceItem {
  from: number
  to: number
  /** chunkId 或者 moduleId */
  value: string
}