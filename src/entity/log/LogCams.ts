import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('log_cams', { schema: 'gifplay_log' })
export class LogCams {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('int', { name: 'cam_id' })
  camId: number;

  @Column('int', { name: 'location_id' })
  locationId: number;

  @Column('text', { name: 'content' })
  content: string;

  @Column('datetime', { name: 'date' })
  date: Date;
}
