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

// to initialize initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
  .then(async () => {
    // here you can start to work with your database
    const book = new Book();
    book.title = "Hello World";
    book.type = "Fiction";
    book.stock = 100;
    book.price = 9.99;
    book.authors = "John Doe";
    const res = await AppDataSource.manager.save(book);

    console.log("book has been saved. book id is", book.id);
    return res;
  })
  .catch((error) => console.log(error));
