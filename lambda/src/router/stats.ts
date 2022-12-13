import { FastifyInstance } from "fastify";

import prisma from "../lib/prisma";

const PREFIX = "/stats";

export async function routes(fastify: FastifyInstance, options: any) {
  fastify.get(PREFIX + "/book-orders-mom", async (request, reply) => {
    const data = await getBookOrdersMonthOverMonth();
    return data;
  });

  fastify.get(PREFIX + "/book-orders-total", async (request, reply) => {
    const data = await getBookOrderTotal();
    return data;
  });
}

async function getBookOrdersMonthOverMonth() {
  const result = await prisma.$queryRaw`
		WITH orders_group_by_month AS (
			SELECT
				b.type AS book_type,
				DATE_FORMAT(ordered_at, '%Y-%c') AS month,
				COUNT(*) AS orders
			FROM orders o
			LEFT JOIN books b ON o.book_id = b.id
			WHERE b.type IS NOT NULL
			GROUP BY book_type, month
		), acc AS (
			SELECT
				book_type,
				month,
				SUM(orders) OVER(PARTITION BY book_type ORDER BY book_type, month ASC) as acc
			FROM orders_group_by_month
			ORDER BY book_type, month ASC
		)
		SELECT * FROM acc;
	`;

  return {
    result: result,
  };
}

async function getBookOrderTotal() {
  const total = await prisma.order.count();

  return {
    orders: total,
  };
}
