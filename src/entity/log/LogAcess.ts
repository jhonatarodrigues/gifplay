import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('log_acess', { schema: 'gifplay_log' })
export class LogAcess {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number

  @Column('text', { name: 'content' })
  content: string

  @Column('varchar', { name: 'route', length: 255 })
  route: string

  @Column('datetime', { name: 'date' })
  date: Date
}
