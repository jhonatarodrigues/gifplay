import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('space_cameras', { schema: 'gifplay' })
export class SpaceCameras {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('int', { name: 'space_id' })
  spaceId: number | null;

  @Column('varchar', { name: 'camera_id', nullable: true, length: 350 })
  cameraId: string | null;

  @Column('varchar', { name: 'camera_alias', nullable: true, length: 350 })
  cameraAlias: string | null;

  @Column('datetime', { name: 'register_date', nullable: true })
  registerDate: Date | null;

  @Column('varchar', { name: 'status', nullable: true, length: 250 })
  status: string | null;

  @Column('boolean', { name: 'record', default: false })
  record: boolean;

  @Column('varchar', { name: 'ip', nullable: true, length: 45 })
  ip: string | null;

  @Column('int', { name: 'port' })
  port: number | null;

  @Column('varchar', { name: 'channel_default', nullable: true, length: 250 })
  channelDefault: string | null;

  @Column('varchar', { name: 'channel_secundary', nullable: true, length: 250 })
  channelSecundary: string | null;

  @Column('varchar', { name: 'user_cam', nullable: true, length: 250 })
  userCam: string | null;

  @Column('varchar', { name: 'password_cam', nullable: true, length: 250 })
  passwordCam: string | null;

  @Column('boolean', { name: 'tcp', default: false })
  tcp: boolean;
}
