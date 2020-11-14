import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('record', { schema: 'gifplay' })
export class Record {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id?: number;

  @Column('int', { name: 'location_id' })
  locationId: number;

  @Column('int', { name: 'cam_id' })
  camId: number;

  @Column('datetime', { name: 'date_start' })
  dateStart: Date | null;

  @Column('datetime', { name: 'date_end' })
  dateEnd: Date | null;

  @Column('int', { name: 'pid', comment: 'numero do processo em execução' })
  pid: number;
}
