import { createConnection } from 'typeorm'
import { Customers } from '../entity/gifplay/Customers'

class DBController {
  constructor () {
    this.connection()
  }

  private async connection ():Promise<void> {
    createConnection().then(async connection => {
      const result = await connection
        .getRepository(Customers)
        .createQueryBuilder('customers')
        .getMany()
      console.log('result ===', result)
      // console.log('conectado === ', connection)
    }).catch(error => {
      console.log('erro ao conectar no banco', error)
    })
  }
}

export default new DBController()
