import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('upload', { schema: 'gifplay' })
export class Upload {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id?: number

  @Column('int', { name: 'id_location' })
  idLocation: number

  @Column('varchar', { name: 'name_file', length: 255 })
  nameFile: string

  @Column('boolean', { name: 'processed' })
  processed: boolean

  @Column('datetime', { name: 'date' })
  dateRegistry: Date
}
