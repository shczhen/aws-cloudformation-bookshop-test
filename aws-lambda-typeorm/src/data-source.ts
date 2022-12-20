import "reflect-metadata";
import { DataSource } from "typeorm";
import { Book } from "./entity/Book";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.TIDB_HOST || "localhost",
  port: parseInt(process.env.TIDB_PORT || "") || 3306,
  username: process.env.TIDB_USER || "test",
  password: process.env.TIDB_PASSWORD || "test",
  ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
  database: "test",
  synchronize: true,
  logging: false,
  entities: [Book],
  migrations: [],
  subscribers: [],
});
