import { FastifyInstance } from "fastify";

export { routes as statsRoutes } from "../router/stats";

// /**
//  * Encapsulates the routes
//  * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
//  * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
//  */
// async function routes(fastify: FastifyInstance, options: any) {
//   fastify.get("/", async (request, reply) => {
//     return { hello: "world" };
//   });
// }
