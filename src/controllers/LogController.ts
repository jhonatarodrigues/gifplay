import DBController from './DBController'
import { LogCams } from '../entity/log/LogCams'
import moment from 'moment-timezone'

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
}

export default new LogController()
