import DBController from './DBController'
import moment from 'moment-timezone'

// -- entity
import { LogCams } from '../entity/log/LogCams'
import { LogAcess } from '../entity/log/LogAcess'

interface ISetCamLog {
  camId: number
  locationId: number
  log: string
  success?: boolean
}

class LogController {
  public async setCamLog({
    camId,
    locationId,
    log,
    success
  }: ISetCamLog): Promise<any> {
    // -- incrementa o log de cameras

    const content = {
      log
    }
    const getParams = {
      entity: LogCams,
      data: [
        {
          camId,
          locationId,
          content: JSON.stringify(content),
          date: moment().format('YYYY-MM-DD HH:mm:ss'),
          code: success ? 1 : 0
        }
      ],
      db: 'log'
    }
    const logCams = await DBController.set(getParams)

    return logCams
  }
  public async setAcessLog(content: any, route: string): Promise<any> {
    // -- incrementa o log de acesso

    const getParams = {
      entity: LogAcess,
      data: [
        {
          route,
          content: JSON.stringify(content),
          date: moment().format('YYYY-MM-DD HH:mm:ss')
        }
      ],
      db: 'log'
    }
    const logCams = await DBController.set(getParams)

    return logCams
  }
}

export default new LogController()
