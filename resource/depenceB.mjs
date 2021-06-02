export * from "./depenceA.mjs";//不包括default
export * as ns from "./depenceA.mjs";//不包括default
export { default } from "./depenceA.mjs";
export { A } from "./depenceA.mjs";