import { Request, Response } from 'express'
import DBController from './DBController'
import moment from 'moment'

// -- entity
import { Locations } from '../entity/gifplay/Locations'
import { SpaceCameras } from '../entity/gifplay/SpaceCameras'

class CronController {
  public async index (req: Request, res: Response):Promise<Response> {
    const dateNow = moment().format('Y-M-DD H:mm')
    const getParams = {
      table: 'locations',
      entity: Locations,
      where: `time_start <= "${dateNow}" AND time_end > "${dateNow}"`,
      leftJoin: {
        condition: 'locations.spaceCameras',
        table: 'space_cameras'
      }
    }
    const locations = await DBController.get(getParams)

    console.log(' ==== locations', locations)

    return res.json({ response: dateNow })
  }
}

export default new CronController()
