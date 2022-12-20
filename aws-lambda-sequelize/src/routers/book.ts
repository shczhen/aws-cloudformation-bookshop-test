import { FastifyInstance, FastifyRequest } from "fastify";

import { loadSequelize } from "../sequelize";
import { getBookModel } from "../sequelize/model";

const PREFIX = "/book";

export async function bookRoutes(fastify: FastifyInstance, options: any) {
  fastify.get(PREFIX, async (request, reply) => {
    try {
      const query = request.query as { [key: string]: string };
      const result = await listBooks(query);
      reply
        .type("application/json")
        .code(200)
        .send(
          JSON.stringify({
            book: "book",
            method: `${request.method}`,
            query,
            result,
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
  const sequelizeInstance = await loadSequelize();
  const Book = getBookModel(sequelizeInstance);
  await Book.sync();
  const result = await Book.findAll();
  sequelizeInstance.close();
  return result;
}

interface NewBook {
  title: string;
  type: string;
  stock: number;
  price: number;
  authors: string;
  publishAt: string;
}

async function postNewBook(bodyData: NewBook) {
  const sequelizeInstance = await loadSequelize();
  const Book = getBookModel(sequelizeInstance);
  await Book.sync();
  const newBook = Book.build({
    ...bodyData,
    publishAt: new Date(bodyData.publishAt),
  });
  await newBook.save();
  sequelizeInstance.close();
  return newBook;
}
