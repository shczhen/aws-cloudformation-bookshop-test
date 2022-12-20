import { FastifyInstance, FastifyRequest } from "fastify";

import { AppDataSource } from "../data-source";
import { Book } from "../entity/Book";

const PREFIX = "/book";

export async function bookRoutes(fastify: FastifyInstance, options: any) {
  fastify.get(PREFIX, async (request, reply) => {
    try {
      const query = request.query as { [key: string]: string };
      const [result, count] = await listBooks(query);
      reply
        .type("application/json")
        .code(200)
        .send(
          JSON.stringify({
            book: "book",
            method: `${request.method}`,
            query,
            result,
            count,
          })
        );
    } catch (err: any) {
      console.error(err);
      reply.code(500).send({
        message: err.message,
      });
    }
  });

  fastify.post(PREFIX, async (request, reply) => {
    const bodyData = request.body as NewBook;
    const result = await postNewBook(bodyData);
    reply
      .type("application/json")
      .code(200)
      .send(
        JSON.stringify({
          book: "book",
          method: `${request.method}`,
          body: bodyData,
          result,
        })
      );
  });
}

async function listBooks(query: any) {
  // const {} = query;
  await AppDataSource.initialize();
  const bookRepository = AppDataSource.getRepository(Book);
  const allBooks = await bookRepository.findAndCount({
    order: {
      id: "ASC",
    },
    skip: 0,
    take: 10,
  });
  await AppDataSource.destroy();
  return allBooks;
}

interface NewBook {
  title: string;
  type: string;
  stock: number;
  price: number;
  authors: string;
  publish_at: string;
}

async function postNewBook(bodyData: NewBook) {
  await AppDataSource.initialize();
  const bookRepository = AppDataSource.getRepository(Book);
  const book = new Book();
  book.title = bodyData.title;
  book.type = bodyData.type;
  book.stock = bodyData.stock;
  book.price = bodyData.price;
  book.authors = bodyData.authors;
  book.publish_at = bodyData.publish_at;
  const result = await bookRepository.save(book);
  await AppDataSource.destroy();
  return result;
}
