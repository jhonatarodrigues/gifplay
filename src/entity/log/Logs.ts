import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('logs', { schema: 'gifplay_log' })
export class Logs {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'username', nullable: true, length: 45 })
  username: string | null;

  @Column('varchar', { name: 'route', nullable: true, length: 255 })
  route: string | null;

  @Column('datetime', { name: 'date', nullable: true })
  date: Date | null;
}
