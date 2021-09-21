import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export default class Record {
  @PrimaryColumn()
  id!: number;

  @Column()
  content!: string;
}
