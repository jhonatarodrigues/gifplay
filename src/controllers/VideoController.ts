import { Request, Response } from 'express'
import DBController from './DBController'
import CamsController from './CamsController'
import LogController from './LogController'
import moment from 'moment-timezone'
import fs from 'fs'

// -- entity
import { Locations } from '../entity/gifplay/Locations'
import { SpaceCameras } from '../entity/gifplay/SpaceCameras'

interface IReceiveConcatCams extends Locations {
  spaceCameras: SpaceCameras[]
}

interface ICams {
  camId: string
  camAlias: string
  nameArchive: string
  fileUrl: string
  thumbs: string[]
}

interface IItensResponseVideo {
  id: number
  playerEmail: string
  dateStart: string
  dateEnd: string
  cams: ICams[]
}

class VideoController {
  public async getVideo(req: Request, res: Response): Promise<Response> {
    const { params } = req
    let whereId: string[] = []
    const locationId = params.locationId
    if (locationId.indexOf(',') >= 0) {
      whereId = locationId.split(',')
    } else {
      whereId = [locationId]
    }

    if (whereId.length === 0) {
      return res.json({
        status: 400,
        msg: 'You need send parameter number bigger then 0, ex: /10'
      })
    }

    console.log('=== params ===', params)
    const dateNow = moment().format('YYYY-MM-DD HH:mm')
    const getParams = {
      table: 'locations',
      entity: Locations,
      where: `locations.id IN (:...id)
              AND time_end < :date
              AND ip <> ''
              AND port <> ''
              AND channel_default <> ''`,
      paramsWhere: { id: whereId, date: dateNow },
      leftJoin: {
        nameNewField: 'locations.spaceCameras',
        table2Entity: SpaceCameras,
        table2Name: 'space_cameras',
        condition: 'locations.spaceId = space_cameras.space_id'
      }
    }
    const locations = await DBController.get(getParams)

    console.log(locations)

    if (locations.length <= 0) {
      return res.status(200).json({
        status: 200,
        msg:
          'Não foi possivel encontrar nenhuma locação com esse id ou a locação está em andamento'
      })
    }

    const responseItens: IItensResponseVideo[] = []
    // -- concatenado em uma promise para que a tela espere o map executar para receber o response
    await Promise.all(
      locations.map(async (location: IReceiveConcatCams) => {
        let videos: ICams[] = []
        await Promise.all(
          location.spaceCameras.map(async (cam: SpaceCameras) => {
            const name =
              CamsController.generateNameArchive(
                cam.cameraAlias || '',
                cam.id,
                location.id
              ) + '-000.mp4'
            const path = `${global.camera.outputFolder}${name}`

            let camUrl = ''
            await fs.promises
              .access(path)
              .then((response) => {
                // achou o arquivo
                camUrl = `${global.url}${global.camera.outputFolder.replace(
                  './',
                  '/'
                )}${name}`
              })
              .catch((error) => {
                // -- não achou o arquivo
                const paramsError = {
                  error: `Não encontramos o arquivo na pasta ${global.camera.outputFolder}, error:${error} `,
                  location: { ...location },
                  cam: { ...cam }
                }
                LogController.setAcessLog(paramsError, '/videos/:locationId')
                camUrl = 'error: Não encontramos o arquivo'
              })

            // -- busca as thumbs existentes
            let thumbs: string[] = []
            if (cam.cameraId && cam.cameraAlias && location.id) {
              await CamsController.getThumbs(
                cam.cameraAlias,
                cam.id,
                location.id
              ).then((response: string[]) => {
                thumbs = response
              })
            }

            videos.push({
              camId: cam.cameraId || '',
              camAlias: cam.cameraAlias || '',
              nameArchive: name,
              fileUrl: camUrl,
              thumbs
            })

            let itemExist = false
            responseItens.map((item) => {
              const newItem = item
              if (item.id === location.id) {
                itemExist = true
                newItem.cams = [...videos]
              }

              return newItem
            })
            if (itemExist === false) {
              responseItens.push({
                id: location.id,
                playerEmail: location.playerEmail || '',
                dateStart: moment(location.timeStart).format(
                  'YYYY-MM-DD HH:mm'
                ),
                dateEnd: moment(location.timeEnd).format('YYYY-MM-DD HH:mm'),
                cams: videos
              })
            }

            return true
          })
        )

        return true
      })
    )

    return res.json(responseItens)
  }
}

export default new VideoController()
