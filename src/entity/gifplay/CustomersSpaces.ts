import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('customers_spaces', { schema: 'gifplay' })
export class CustomersSpaces {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('int', { name: 'customer_id', nullable: true })
  customerId: number | null;

  @Column('varchar', { name: 'title', nullable: true, length: 255 })
  title: string | null;

  @Column('datetime', { name: 'register_date', nullable: true })
  registerDate: Date | null;

  @Column('varchar', { name: 'status', nullable: true, length: 255 })
  status: string | null;
}
