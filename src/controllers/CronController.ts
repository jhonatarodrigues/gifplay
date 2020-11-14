import { Request, Response } from 'express'
import DBController from './DBController'
import moment from 'moment'
import CamsController from './CamsController'
import LogController from './LogController'

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
        console.log('Cam ====', cam)
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

          // --  log de inicio de gravação
          pidCam.then(pid => {
            const params = {
              camId: cam.id,
              locationId: parseInt(location.id, 10),
              log: `iniciando gravação da camera, pid: ${pid}`,
              success: true
            }
            LogController.setCamLog(params)
          })
        } else {
          const params = {
            camId: cam.id,
            locationId: location.id,
            log: 'A camera não está cadastrada de forma correta, falta informações para buscar o video'
          }
          LogController.setCamLog(params)
        }
      })

      return location
    })

    return res.json({ response: dateNow })
  }
}

export default new CronController()
