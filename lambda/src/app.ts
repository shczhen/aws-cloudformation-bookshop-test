import Fastify from "fastify";

import { statsRoutes } from "./router/index";

const fastify = Fastify({
  logger: true,
});

fastify.get("/", async (request, reply) => {
  reply.type("application/json").code(200);
  return { hello: "world" };
});

fastify.register(statsRoutes);

if (require.main === module) {
  console.log("Running as a script");
  fastify.listen({ port: 3000 }, (err, address) => {
    if (err) throw err;
    // Server is now listening on ${address}
  });
}

export default fastify;
