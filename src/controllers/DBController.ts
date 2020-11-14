import { createConnection, getConnection } from 'typeorm'

interface LeftJoin {
  nameNewField: string,
  table2Entity: any,
  table2Name: string,
  condition: string,

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
    let response = null
    if (where) {
      if (leftJoin) {
        response = await getConnection()
          .createQueryBuilder()
          .select(table)
          .from(entity, table)
          .leftJoinAndMapMany(leftJoin.nameNewField, leftJoin.table2Entity, leftJoin.table2Name, leftJoin.condition)
          .where(where, paramsWhere || {})
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
          .leftJoinAndMapMany(leftJoin.nameNewField, leftJoin.table2Entity, leftJoin.table2Name, leftJoin.condition)
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
