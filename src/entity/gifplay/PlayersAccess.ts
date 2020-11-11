import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('players_access', { schema: 'gifplay' })
export class PlayersAccess {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'username', nullable: true, length: 45 })
  username: string | null;

  @Column('varchar', { name: 'ip', nullable: true, length: 250 })
  ip: string | null;

  @Column('text', { name: 'browser', nullable: true })
  browser: string | null;

  @Column('datetime', { name: 'date', nullable: true })
  date: Date | null;

  @Column('varchar', { name: 'domain', nullable: true, length: 255 })
  domain: string | null;

  @Column('varchar', { name: 'country', nullable: true, length: 11 })
  country: string | null;
}
