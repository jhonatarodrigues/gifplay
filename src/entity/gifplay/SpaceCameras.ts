import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('space_cameras', { schema: 'gifplay' })
export class SpaceCameras {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('int', { name: 'space_id', nullable: true })
  spaceId: number | null;

  @Column('varchar', { name: 'camera_id', nullable: true, length: 350 })
  cameraId: string | null;

  @Column('varchar', { name: 'camera_alias', nullable: true, length: 350 })
  cameraAlias: string | null;

  @Column('datetime', { name: 'register_date', nullable: true })
  registerDate: Date | null;

  @Column('varchar', { name: 'status', nullable: true, length: 250 })
  status: string | null;
}
