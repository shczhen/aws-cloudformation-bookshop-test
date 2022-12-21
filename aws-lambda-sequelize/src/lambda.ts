import awsLambdaFastify from "@fastify/aws-lambda";
import init, { getBook, postBook, putBook, deleteBook } from "./app";

const proxy = awsLambdaFastify(init());
const proxyGetBook = awsLambdaFastify(getBook());
const proxyPostBook = awsLambdaFastify(postBook());
const proxyPutBook = awsLambdaFastify(putBook());
const proxyDeleteBook = awsLambdaFastify(deleteBook());

export const handler = proxy;
export const getBookHandler = proxyGetBook;
export const postBookHandler = proxyPostBook;
export const putBookHandler = proxyPutBook;
export const deleteBookHandler = proxyDeleteBook;
