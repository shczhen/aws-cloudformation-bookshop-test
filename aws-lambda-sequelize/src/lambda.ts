import awsLambdaFastify from "@fastify/aws-lambda";
import init, { getBook } from "./app";

const proxy = awsLambdaFastify(init());
const proxyGetBook = awsLambdaFastify(getBook());

export const handler = proxy;
export const getBookHandler = proxyGetBook;
