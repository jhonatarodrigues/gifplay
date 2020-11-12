import { createConnection, getConnection } from 'typeorm'
import { SpaceCameras } from '../entity/gifplay/SpaceCameras'

interface LeftJoin {
  condition: string,
  table: string
}
interface IGet {
  table: string,
  entity: any,
  where?: string,
  paramsWhere?: any
  leftJoin?: LeftJoin,
}
class DBController {
  public async connection ():Promise<void> {
    await createConnection().then(() => {
      console.log('bd connected')
    }).catch(error => {
      console.log('error')
      throw new Error(error)
    })
  }

  public async get ({ table, entity, where, paramsWhere, leftJoin }:IGet): Promise<any> {
    console.log('haoba')

    let response = null
    if (where) {
      if (leftJoin) {
        response = await getConnection()
          .createQueryBuilder()
          .select(table)
          .from(entity, table)
          // .leftJoinAndSelect(SpaceCameras, 'space_cameras', 'locations.spaceId = space_cameras.space_id')
          .leftJoinAndMapMany('locations.spaceCameras', SpaceCameras, 'space_cameras', 'locations.spaceId = space_cameras.space_id')
          // .where(where, paramsWhere || {})
          // .getSql()
          .getMany()
      } else {
        response = await getConnection()
          .createQueryBuilder()
          .select(table)
          .from(entity, table)
          .where(where, paramsWhere || {})
          .getMany()
      }
    } else {
      if (leftJoin) {
        response = await getConnection()
          .createQueryBuilder()
          .select(table)
          .from(entity, table)
          .leftJoinAndSelect(leftJoin.condition, leftJoin.table)
          .getMany()
      } else {
        response = await getConnection()
          .createQueryBuilder()
          .select(table)
          .from(entity, table)
          .getMany()
      }
    }

    return response
  }
}

export default new DBController()
