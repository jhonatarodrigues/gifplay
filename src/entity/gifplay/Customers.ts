import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('customers', { schema: 'gifplay' })
export class Customers {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'image', nullable: true, length: 250 })
  image: string | null;

  @Column('varchar', { name: 'password', length: 255 })
  password: string;

  @Column('varchar', { name: 'name', nullable: true, length: 255 })
  name: string | null;

  @Column('varchar', { name: 'title', nullable: true, length: 255 })
  title: string | null;

  @Column('varchar', { name: 'phone', nullable: true, length: 255 })
  phone: string | null;

  @Column('varchar', { name: 'cpf', nullable: true, length: 255 })
  cpf: string | null;

  @Column('text', { name: 'address', nullable: true })
  address: string | null;

  @Column('varchar', { name: 'city', nullable: true, length: 255 })
  city: string | null;

  @Column('varchar', { name: 'state', nullable: true, length: 255 })
  state: string | null;

  @Column('datetime', { name: 'register_date', nullable: true })
  registerDate: Date | null;

  @Column('varchar', { name: 'zipcode', nullable: true, length: 255 })
  zipcode: string | null;

  @Column('varchar', { name: 'level', length: 45 })
  level: string;

  @Column('varchar', { name: 'email', nullable: true, length: 150 })
  email: string | null;

  @Column('tinyint', {
    name: 'authorised',
    nullable: true,
    width: 1,
    default: () => "'0'"
  })
  authorised: boolean | null;

  @Column('varchar', { name: 'status', nullable: true, length: 50 })
  status: string | null;

  @Column('datetime', { name: 'block_expires', nullable: true })
  blockExpires: Date | null;

  @Column('int', {
    name: 'login_attempts',
    nullable: true,
    unsigned: true,
    default: () => "'0'"
  })
  loginAttempts: number | null;

  @Column('varchar', { name: 'uersname', length: 45 })
  uersname: string;
}
