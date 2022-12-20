import { FastifyInstance, FastifyRequest } from "fastify";
import { BookType } from "@prisma/client";

import prisma from "../lib/prisma";

const PREFIX = "/book";
const DEFAULT_PAGE_NUM = 1;
const DEFAULT_PAGE_SIZE = 8;
enum SortType {
  PRICE = "price",
  PUBLISHED_AT = "publishedAt",
}
enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}
const sortTypes = Object.values(SortType);
const sortOrders = Object.values(SortOrder);
const bookTypes = Object.keys(BookType);

export async function bookRoutes(fastify: FastifyInstance, options: any) {
  fastify.get(PREFIX, async (request, reply) => {
    try {
      const query = request.query as { [key: string]: string };
      const result = await getBookList(query);
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

function parseBookListQuery(
  query: any,
  sorting: boolean = false,
  paging: boolean = false
) {
  const q: any = {};

  // Filtering.
  // Reference: https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting
  q.where = {};
  if (typeof query.type === "string") {
    if (!bookTypes.includes(query.type)) {
      throw new Error(
        `Parameter \`type\` must be one of [${bookTypes.join(", ")}].`
      );
    }
    q.where.type = query.type;
  }

  // Sorting.
  if (sorting) {
    if (sortTypes.includes(query.sort)) {
      let order = SortOrder.ASC;
      if (sortOrders.includes(query.order)) {
        order = query.order;
      }

      if (query.sort === SortType.PRICE) {
        q.orderBy = {
          price: order,
        };
      } else if (query.sort === SortType.PUBLISHED_AT) {
        q.orderBy = {
          publishedAt: order,
        };
      }
    }
  }

  // Paging.
  if (paging) {
    let page = DEFAULT_PAGE_NUM;
    let size = DEFAULT_PAGE_SIZE;
    if (typeof query.page === "string") {
      page = parseInt(query.page);
    }
    if (typeof query.size === "string") {
      size = parseInt(query.size);
    }
    if (size < 0 || size > 100) {
      throw new Error("Parameter `size` must between 0 and 100.");
    }
    q.take = size;
    q.skip = (page - 1) * size;
  }

  return q;
}

async function getBookList(queryObj: { [key: string]: string }) {
  // Querying with joins (Many to many relation).
  const query = parseBookListQuery(queryObj, true, true);
  const books: any[] = await prisma.book.findMany({
    ...query,
    include: {
      authors: {
        select: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
  const bookIds = books.map((b) => b.id);

  // Grouping.
  //
  // Calculate the average rating score for the books in the result.
  //
  // Notice: It is more suitable to add column named `average_rating` in books table to store
  // the average rating score, which can avoid the need to query every time you use it, and
  // it is easier to implement the sorting feature.
  const bookAverageRatings = await prisma.rating.groupBy({
    by: ["bookId"],
    _avg: {
      score: true,
    },
    where: {
      bookId: {
        in: bookIds,
      },
    },
    // Why must set orderBy?
    orderBy: {
      _avg: {
        score: "asc",
      },
    },
  });
  for (const rating of bookAverageRatings) {
    const index = books.findIndex((b) => b.id === rating.bookId);
    books[index].averageRating = rating._avg.score;
  }

  const bookCountRatings = await prisma.rating.groupBy({
    by: ["bookId"],
    _count: {
      bookId: true,
    },
    where: {
      bookId: {
        in: bookIds,
      },
    },
    orderBy: {
      _count: {
        bookId: "asc",
      },
    },
  });
  for (const rating of bookCountRatings) {
    const index = books.findIndex((b) => b.id === rating.bookId);
    books[index].ratings = rating._count.bookId;
  }

  // Counting.
  const total = await prisma.book.count(parseBookListQuery(queryObj));

  return {
    content: books,
    total: total,
  };
}

interface NewBook {
  id: bigint | number;
  title: string;
  type: BookType;
  publishedAt: string;
  stock: number;
  price: number;
}

async function postNewBook(data: NewBook) {
  // model Book {
  //   id           BigInt     @id
  //   title        String     @db.VarChar(100)
  //   type         BookType
  //   publishedAt  DateTime   @db.DateTime(0) @map("published_at")
  //   stock        Int        @default(0)
  //   price        Decimal    @default(0.0) @db.Decimal(15, 2)
  //   authors      BookAuthor[]
  //   ratings      Rating[]
  //   orders       Order[]
  //   @@map("books")
  // }
  // model BookAuthor {
  //   book     Book   @relation(fields: [bookId], references: [id])
  //   bookId   BigInt @map("book_id")
  //   author   Author @relation(fields: [authorId], references: [id])
  //   authorId BigInt @map("author_id")
  //   @@id([bookId, authorId])
  //   @@map("book_authors")
  // }
  // model Author {
  //   id          BigInt   @id
  //   name        String   @db.VarChar(100)
  //   gender      Boolean?
  //   birthYear   Int?     @db.SmallInt @map("birth_year")
  //   deathYear   Int?     @db.SmallInt @map("death_year")
  //   books       BookAuthor[]
  //   @@map("authors")
  // }
  // TODO
  const res = await prisma.book.create({
    data: {
      id: data.id,
      title: data.title,
      type: data.type,
      publishedAt: new Date(data.publishedAt).toISOString(),
      stock: data.stock,
      price: data.price,
    },
  });
  return res;
}
