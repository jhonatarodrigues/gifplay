import { Request, Response } from 'express'
import DBController from './DBController'
import moment from 'moment'
import CamsController from './CamsController'

// -- entity
import { Locations } from '../entity/gifplay/Locations'
import { SpaceCameras } from '../entity/gifplay/SpaceCameras'

class CronController {
  public async index (req: Request, res: Response):Promise<Response> {
    // -- busca as locacoes e aciona a funcao para gravar os videos.
    const dateNow = moment().format('Y-M-DD H:mm')
    const getParams = {
      table: 'locations',
      entity: Locations,
      where: `time_start <= "${dateNow}"
              AND time_end > "${dateNow}"
              AND ip <> ''
              AND port <> ''
              AND channel_default <> ''`,
      leftJoin: {
        nameNewField: 'locations.spaceCameras',
        table2Entity: SpaceCameras,
        table2Name: 'space_cameras',
        condition: 'locations.spaceId = space_cameras.space_id'
      }
    }
    const locations = await DBController.get(getParams)

    locations.map((location:any) => {
      // -- dispara a funcao para gravar video de cada camera
      const { spaceCameras } = location

      spaceCameras.map((cam:SpaceCameras) => {
        console.log('aaaaa ====', cam)
        if (location.id &&
          cam.id &&
          cam.cameraAlias &&
          cam.ip &&
          cam.port &&
          cam.channelDefault) {
          const pidCam = CamsController.getMovieCam(
            {
              LocationID: location.id,
              ID: cam.id,
              name: cam.cameraAlias,
              IP: cam.ip,
              port: cam.port,
              channel: cam.channelDefault,
              tcp: cam.tcp,
              user: cam.userCam || '',
              password: cam.passwordCam || ''
            }
          )
          console.log('pidCam ===', pidCam)
        }
      })

      return location
    })

    return res.json({ response: dateNow })
  }
}

export default new CronController()
