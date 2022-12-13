import awsLambdaFastify from "@fastify/aws-lambda";
import fastify from "./app";

const proxy = awsLambdaFastify(fastify);

export default proxy;
