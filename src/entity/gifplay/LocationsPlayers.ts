import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('locations_players', { schema: 'gifplay' })
export class LocationsPlayers {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('int', { name: 'location_id', nullable: true })
  locationId: number | null;

  @Column('varchar', { name: 'player_email', nullable: true, length: 350 })
  playerEmail: string | null;

  @Column('datetime', { name: 'register_date', nullable: true })
  registerDate: Date | null;

  @Column('varchar', { name: 'status', nullable: true, length: 250 })
  status: string | null;
}
