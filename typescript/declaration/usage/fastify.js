class FastifyInstance {}
function fastify() {
  return new FastifyInstance();
}
fastify.FastifyInstance = FastifyInstance;
// Allows for { fastify }
fastify.fastify = fastify;
// Allows for strict ES Module support
fastify.default = fastify;
// Sets the default export
// module.exports = fastify;
export default fastify;