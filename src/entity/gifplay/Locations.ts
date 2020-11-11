import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('locations', { schema: 'gifplay' })
export class Locations {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('int', { name: 'space_id', nullable: true })
  spaceId: number | null;

  @Column('varchar', { name: 'player_email', nullable: true, length: 200 })
  playerEmail: string | null;

  @Column('datetime', { name: 'time_start', nullable: true })
  timeStart: Date | null;

  @Column('datetime', { name: 'time_end', nullable: true })
  timeEnd: Date | null;

  @Column('datetime', { name: 'register_date', nullable: true })
  registerDate: Date | null;

  @Column('varchar', { name: 'public', nullable: true, length: 50 })
  public: string | null;

  @Column('varchar', { name: 'status', nullable: true, length: 250 })
  status: string | null;

  @Column('tinyint', {
    name: 'full_movie_ready',
    nullable: true,
    width: 1,
    default: () => "'0'"
  })
  fullMovieReady: boolean | null;

  @Column('tinyint', {
    name: 'in_progress',
    nullable: true,
    width: 1,
    default: () => "'0'"
  })
  inProgress: boolean | null;

  @Column('varchar', { name: 'erro', nullable: true, length: 250 })
  erro: string | null;
}
