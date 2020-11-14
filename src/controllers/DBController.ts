import { createConnections, getConnection } from 'typeorm'

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
  db?: string
}

interface IInsert {
  entity: any,
  data: any[],
  db?: string
}
class DBController {
  public async connection ():Promise<void> {
    await createConnections().then(() => {
      console.log('bd connected')
    }).catch(error => {
      console.log('error')
      throw new Error(error)
    })
  }

  public async get ({ table, entity, where, paramsWhere, leftJoin, db = 'default' }:IGet): Promise<any> {
    let response = null

    const connection = await getConnection(db)
    if (where) {
      if (leftJoin) {
        response = connection
          .createQueryBuilder()
          .select(table)
          .from(entity, table)
          .leftJoinAndMapMany(leftJoin.nameNewField, leftJoin.table2Entity, leftJoin.table2Name, leftJoin.condition)
          .where(where, paramsWhere || {})
          .getMany()
      } else {
        response = connection
          .createQueryBuilder()
          .select(table)
          .from(entity, table)
          .where(where, paramsWhere || {})
          .getMany()
      }
    } else {
      if (leftJoin) {
        response = connection
          .createQueryBuilder()
          .select(table)
          .from(entity, table)
          .leftJoinAndMapMany(leftJoin.nameNewField, leftJoin.table2Entity, leftJoin.table2Name, leftJoin.condition)
          .getMany()
      } else {
        response = connection
          .createQueryBuilder()
          .select(table)
          .from(entity, table)
          .getMany()
      }
    }

    return response
  }

  public async set ({ entity, data, db = 'default' }: IInsert): Promise<any> {
    const response = await getConnection(db)
      .createQueryBuilder()
      .insert()
      .into(entity)
      .values(data)
      .execute()

    return response
  }
}

export default new DBController()
