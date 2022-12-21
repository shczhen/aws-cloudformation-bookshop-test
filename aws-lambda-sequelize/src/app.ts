import Fastify from "fastify";

import { bookRoutes } from "./routers/book";
import { getBookRoutes } from "./routers/getBook";

// fastify.get("/", async (request, reply) => {
//   reply.type("application/json").code(200);
//   reply.send({ hello: "world" });
//   // return { hello: "world" };
// });

export default function init() {
  const app = Fastify({
    logger: true,
  });
  app.register(bookRoutes);
  app.all("/book/:id", async (request, reply) => {
    const { id } = request.params as any;
    reply
      .type("application/json")
      .code(200)
      .send(
        JSON.stringify({ book: "book", id: id, method: `${request.method}` })
      );
  });
  app.all("/", (request, reply) => reply.send({ hello: "world" }));
  return app;
}

export function getBook() {
  const app = Fastify({
    logger: true,
  });
  app.register(getBookRoutes);
  return app;
}

if (require.main === module) {
  console.log("Running as a script");
  getBook().listen({ port: 3000 }, (err, address) => {
    if (err) throw err;
    // Server is now listening on ${address}
  });
}
