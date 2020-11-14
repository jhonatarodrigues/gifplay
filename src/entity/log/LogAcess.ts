import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('log_acess', { schema: 'gifplay_log' })
export class LogAcess {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'username', nullable: true, length: 45 })
  username: string | null;

  @Column('varchar', { name: 'route', nullable: true, length: 255 })
  route: string | null;

  @Column('datetime', { name: 'date', nullable: true })
  date: Date | null;
}
