import awsLambdaFastify from "@fastify/aws-lambda";
import init from "./app";

const proxy = awsLambdaFastify(init());

export const handler = proxy;
