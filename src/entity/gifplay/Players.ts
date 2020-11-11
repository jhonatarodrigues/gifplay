import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Index('username_2', ['username'], { unique: true })
@Index('email', ['email'], {})
@Index('username', ['username'], {})
@Index('level', ['level'], {})
@Entity('players', { schema: 'gifplay' })
export class Players {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'username', unique: true, length: 45 })
  username: string;

  @Column('varchar', { name: 'image', nullable: true, length: 250 })
  image: string | null;

  @Column('varchar', { name: 'password', length: 255 })
  password: string;

  @Column('varchar', { name: 'firstname', nullable: true, length: 255 })
  firstname: string | null;

  @Column('varchar', { name: 'lastname', nullable: true, length: 255 })
  lastname: string | null;

  @Column('varchar', { name: 'apelido', nullable: true, length: 255 })
  apelido: string | null;

  @Column('date', { name: 'nascimento', nullable: true })
  nascimento: string | null;

  @Column('varchar', { name: 'level', length: 45 })
  level: string;

  @Column('varchar', { name: 'email', nullable: true, length: 150 })
  email: string | null;

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

  @Column('varchar', { name: 'zipcode', nullable: true, length: 255 })
  zipcode: string | null;

  @Column('datetime', { name: 'register_date', nullable: true })
  registerDate: Date | null;

  @Column('tinyint', {
    name: 'authorised',
    nullable: true,
    width: 1,
    default: () => "'0'"
  })
  authorised: boolean | null;

  @Column('varchar', { name: 'status', nullable: true, length: 255 })
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
}
