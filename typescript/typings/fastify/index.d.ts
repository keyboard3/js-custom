declare class FastifyInstance { }
interface Fastify {
  (): FastifyInstance;
  FastifyInstance: FastifyInstance
  fastify: Fastify,
  default: Fastify
}
declare const fastify: Fastify;
declare module "*fastify" {
  export = fastify;
}