import { Request, Response } from 'express'
import DBController from './DBController'
import CamsController from './CamsController'
import LogController from './LogController'
import moment from 'moment-timezone'
import fs from 'fs'

// -- entity
import { Locations } from '../entity/gifplay/Locations'
import { Record } from '../entity/gifplay/Record'
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
  public async setVideoCut(req: Request, res: Response): Promise<Response> {
    const params = req.query

    if (
      !params.cam ||
      !params.location ||
      !params.timeStartCut ||
      !params.timeEndCut ||
      !params.camAlias
    ) {
      return res
        .status(203)
        .json({
          msg:
            'você precisa enviar todos os parametros (cam, location, timeStartCut, timeEndCut)'
        })
    }

    const getParams = {
      table: 'record',
      entity: Record,
      where: `cam_id = :id and location_id = :location`,
      paramsWhere: { id: params.cam, location: params.location }
    }
    const record = await DBController.get(getParams)
    if (record.length > 0) {
      return res
        .status(206)
        .json({ msg: 'Esse video não pode ser cortado, ele está em gravação.' })
    }
    let statusResponseCut = 0
    let mensagemResponseCut = ''

    await CamsController.cutVideo(
      String(params.camAlias),
      parseInt(String(params.cam), 10),
      parseInt(String(params.location), 10),
      parseInt(String(params.timeStartCut), 10),
      parseInt(String(params.timeEndCut), 10)
    ).then((response) => {
      if (response) {
        statusResponseCut = response.status
        mensagemResponseCut = response.msg
      }
    })

    if (statusResponseCut) {
      return res.status(statusResponseCut).json({ msg: mensagemResponseCut })
    }

    return res
      .status(200)
      .json({ msg: 'em processo de corte, aguarde para fazer o donwload.' })
  }

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
      return res.status(400).json({
        status: 400,
        msg: 'You need send parameter number bigger then 0, ex: /10'
      })
    }

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

    return res.status(200).json(responseItens)
  }
}

export default new VideoController()
