import awsLambdaFastify from "@fastify/aws-lambda";
import init, { getBook, postBook } from "./app";

const proxy = awsLambdaFastify(init());
const proxyGetBook = awsLambdaFastify(getBook());
const proxyPostBook = awsLambdaFastify(postBook());

export const handler = proxy;
export const getBookHandler = proxyGetBook;
export const postBookHandler = proxyPostBook;
