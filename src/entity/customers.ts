import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Customers {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
      length: 45
  })
  uersname: string;

  @Column({
    length: 250
  })
  image: string;

  @Column({
    length: 250
  })
  password: string;

  @Column({
    length: 255
  })
  name: string;

  @Column({
    length: 255
  })
  title: string;

  @Column({
    length: 255
  })
  phone: string;

  @Column({
    length: 255
  })
  cpf: string;

  @Column('text')
  address: string;

  @Column({
    length: 255
  })
  city: string;

  @Column({
    length: 255
  })
  state: string;

  @Column('datetime')
  register_date: Date;

  @Column({
    length: 255
  })
  zipcode: string;

  @Column({
    length: 45
  })
  level: string;

  @Column({
    length: 150
  })
  email: string;

  @Column('boolean')
  authorised: boolean;

  @Column({
    length: 50
  })
  status: string;

  @Column('datetime')
  block_expires: Date;

  @Column({
    length: 10
  })
  login_attempts:number;
}