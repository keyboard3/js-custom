export function isModule(module: Partial<ContextModule | Module>): module is Partial<Module> {
  return !!((module as unknown) as Partial<Module>).filename;
}
export function isContextModule(module: Partial<ContextModule | Module>): module is Partial<ContextModule> {
  return !!((module as unknown) as Partial<ContextModule>).dirname;
}
