import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    length: 100,
  })
  title!: string;

  @Column({
    length: 100,
  })
  type!: string;

  @Column()
  publish_at!: string;

  @Column("int")
  stock!: number;

  @Column("double")
  price!: number;

  @Column()
  authors!: string;
}
