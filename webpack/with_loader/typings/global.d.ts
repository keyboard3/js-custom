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
  /** 用来替换模块 {"old-module": "new-module"} */
  alias: { [key: string]: string }
  /**
   * 扩展 loader 的映射 {test: /\.extension$/, loader: "myloader"}
   * 如果没有其他 loader 设置，则会去匹配这个正则找到相对应的 loader
   * 自动追加了对 .coffee/.json/.jade/.css/.less 指定的 loader
   */
  loaders: { test: RegExp, loader: string }[]
  /** 
   * loader 模块名紧跟着的后缀
   * 没有就默认: ["-webpack-web-loader", "-webpack-loader", "-web-loader", "-loader", ""]
   */
  loaderPostfixes: string[]
  /** 
   * loader 模块可能的文件后缀
   * 没有就默认: [".webpack-web-loader.js", ".webpack-loader.js", ".web-loader.js", ".loader.js", "", ".js"]
   */
  loaderExtensions: string[]
  /** 
   * 搜索的路径组合,下面是自动追加在末尾
   * absolutePath/buildin
   * absolutePath/buildin/web_modules
   * absolutePath/buildin/node_modules
   * absolutePath/node_modules
   */
  paths: string[]
  /**
   * 模块名后缀
   * 没有就默认: ["", "-webpack", "-web"]
   */
  postfixes: string[]
  /** 
  * 模块可能的文件后缀
  * 未指定默认: ["", ".webpack.js", ".web.js", ".js"]
  */
  extensions: string[]
}
type Overwrite = {
  /** 自定义的模块重写 */
  [key: string]: any
  /** 默认 __webpack_process */
  process: string
  /** __webpack_module+(module) */
  module: string
  /** __webpack_console */
  console: string
  /** __webpack_global */
  global: string
  /** buffer+.Buffer */
  Buffer: string
  /** __webpack_dirname */
  "__dirname": string
  /** __webpack_filename */
  "__filename": string
}
type Parse = {
  require?: boolean
  /** 全局模块变量会被替换成指定模块 { "$": "jquery" } */
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
  /** 在变动时重新编译(loader 除外) */
  watch: boolean
  /** nodejs 的事件监听  */
  events: NodeJS.EventEmitter
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
  /** todo */
  parse: Partial<Parse>
  /** 解析模块的相关配置  */
  resolve: Partial<Resolve>
}
type ModuleReason = {
  type: "main" | "require" | "async require" | "context" | "async context"
  count?: number
  filename?: string
}
interface DepTree {
  warnings: string[]
  errors: string[]
  modules: DepTree["modulesByFile"]
  modulesByFile: { [key: Module["filename"]]: Partial<Module | ContextModule> }
  modulesById: { [key: Module["id"]]: Partial<Module | ContextModule> }
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
interface BaseModule {
  /** 模块的创建顺序 id */
  id: number
  /** 模块的名称排序 id */
  realId: number
  /** 目录名 or 模块名 */
  name: string
  /** 被引用过 chunkIds */
  chunks: Chunk["id"][]
  /** 模块被引用的原因 */
  reasons: ModuleReason[]
  /** 模块被引用的次数 */
  usages: number
  size: number
}
interface Module extends BaseModule, ModuleDeps {
  /** 作为主模块会记录主 chunk 的 id */
  chunkId: Chunk["id"]
  /** 模块内容 */
  source: string
  /** 模块被检索到的实际文件地址 */
  filename: string
}
interface ContextModule extends BaseModule {
  /** 目录的绝对路径 */
  dirname: string
  /** 目录下所有有效模块的依赖(自动解析依赖) */
  requires: ModuleDeps["requires"]
  /** 目录下所有有效模块的路径映射 */
  requireMap: { [key: Module["filename"]]: Module["id"] }
}
interface SourceReplaceItem {
  from: number
  to: number
  /** chunkId 或者 moduleId */
  value: string
}