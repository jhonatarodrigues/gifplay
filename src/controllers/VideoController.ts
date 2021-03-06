import { Request, Response } from 'express'
import DBController from './DBController'
import CamsController from './CamsController'
import LogController from './LogController'
import moment from 'moment-timezone'
import fs from 'fs'

// -- entity
import { Locations } from '../entity/gifplay/Locations'
import { Record } from '../entity/gifplay/Record'
import { Upload } from '../entity/gifplay/Upload'
import { SpaceCameras } from '../entity/gifplay/SpaceCameras'

interface IReceiveConcatCams extends Locations {
  spaceCameras: SpaceCameras[]
  upload: Upload[]
}

interface IUpload extends Upload {
  filePath: string
}

interface ICams {
  id: number
  camId: string
  camAlias: string
  nameArchive: string
  fileUrl: string
  previewFileUrl: string
  thumbs: string[]
}

interface IItensResponseVideo {
  id: number
  playerEmail: string
  dateStart: string
  dateEnd: string
  cams: ICams[]
  upload: IUpload[]
}

class VideoController {
  public async getVideoCut(req: Request, res: Response): Promise<Response> {
    const params = req.query

    if (!params.transactionId) {
      return res.status(203).json({
        msg: 'você precisa enviar todos os parametros (transactionId)'
      })
    }

    let fileUrl = ''
    await CamsController.getCutVideo(String(params.transactionId)).then(
      (response) => {
        fileUrl = response
      }
    )

    if (!fileUrl) {
      return res.status(400).json({
        msg: 'Não encontramos o video, por favor verifique os parametros.'
      })
    }

    return res.status(200).json({ fileUrl })
  }

  public async getUploadCut(req: Request, res: Response): Promise<Response> {
    const params = req.query

    if (!params.transactionId) {
      return res.status(203).json({
        msg: 'você precisa enviar todos os parametros (transactionId)'
      })
    }

    let fileUrl = ''
    const path = `${global.camera.uploadFolderCut}/${params.transactionId}.mp4`
    await fs.promises.access(path).then(() => {
      // achou o arquivo
      fileUrl = `/${global.camera.uploadFolderCut.replace('./', '')}/${
        params.transactionId
      }.mp4`
    })

    if (!fileUrl) {
      return res.status(400).json({
        msg: 'Não encontramos o video, por favor verifique os parametros.'
      })
    }

    return res.status(200).json({ fileUrl })
  }

  public async setSendFile(req: Request, res: Response): Promise<Response> {
    const params = req.body
    const file = req.file

    if (!params.idLocation || !file.originalname) {
      return res.status(203).json({
        msg: 'você precisa enviar todos os parametros (idLocation, file)'
      })
    }

    const fileName = `${file.filename}`
    const dataUpload: Upload[] = [
      {
        idLocation: params.idLocation,
        nameFile: fileName,
        processed: false,
        audio: params.audio || false,
        preview: false,
        dateRegistry: moment().toDate()
      }
    ]

    const uploadParams = {
      entity: Upload,
      data: dataUpload
    }
    let response: Response = res.status(200)
    await DBController.set(uploadParams)
      .then(() => {
        response = res.status(200).json({
          msg: `Arquivo enviado para a locação ${params.idLocation} com sucesso!`
        })
      })
      .catch((err) => {
        response = res.status(400).json({
          msg: `Erro ao enviar o arquivo para a locação ${params.idLocation}: ${err}`
        })
      })

    return response
  }

  public async setVideoCut(req: Request, res: Response): Promise<Response> {
    const params = req.query

    if (
      !params.cam ||
      !params.location ||
      !params.timeStartCut ||
      !params.secondsCut ||
      !params.camAlias ||
      !params.transactionId
    ) {
      return res.status(203).json({
        msg:
          'você precisa enviar todos os parametros (cam, location, timeStartCut, secondsCut)'
      })
    }

    const getParams = {
      table: 'record',
      entity: Record,
      where: 'cam_id = :id and location_id = :location',
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
      parseInt(String(params.secondsCut), 10),
      String(params.transactionId)
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

  public async setUploadCut(req: Request, res: Response): Promise<Response> {
    const params = req.query

    if (
      !params.idVideo ||
      !params.timeStartCut ||
      !params.secondsCut ||
      !params.transactionId
    ) {
      return res.status(203).json({
        msg:
          'você precisa enviar todos os parametros (idvideo, timeStartCut, secondsCut)'
      })
    }

    const getParams = {
      table: 'upload',
      entity: Upload,
      where: 'id = :id and processed = true and preview = true',
      paramsWhere: { id: params.idVideo }
    }
    const video = await DBController.get(getParams)

    if (video.length <= 0) {
      return res
        .status(206)
        .json({ msg: 'Video não encontrado ou em processamento.' })
    }

    const [upload] = video
    const extension = upload.nameFile.split('.').pop()
    const pathFile = `${global.camera.uploadFolderPreview}/${upload.nameFile}`
    const destinyFile = `${global.camera.uploadFolderCut}/${params.transactionId}.${extension}`

    await CamsController.cutVideoUpload(
      upload.nameFile,
      pathFile,
      destinyFile,
      upload.idLocation,
      parseInt(String(params.timeStartCut), 10),
      parseInt(String(params.secondsCut), 10)
    )

    return res
      .status(200)
      .json({ msg: 'em processo de corte, aguarde para fazer o donwload.' })
  }

  public async deleteUpload(req: Request, res: Response): Promise<Response> {
    const params = req.query

    if (!params.idVideo) {
      return res.status(203).json({
        msg:
          'você precisa enviar todos os parametros (idvideo, timeStartCut, secondsCut)'
      })
    }

    const getParams = {
      table: 'upload',
      entity: Upload,
      where: 'id = :id',
      paramsWhere: { id: params.idVideo }
    }
    const video = await DBController.get(getParams)
    if (video.length === 0) {
      return res.status(206).json({ msg: 'O video não foi encontrado' })
    }

    const [upload] = video

    const pathVideo = `${global.camera.uploadFolderPreview}/${upload.nameFile}`

    const paramsDelete = {
      entity: Upload,
      where: `id = ${params.idVideo}`
    }
    DBController.delete(paramsDelete)

    fs.unlink(pathVideo, () => {
      // --
      const params = {
        camId: 0,
        locationId: upload.idLocation,
        log: `video apagado: ${pathVideo}`,
        success: true
      }
      LogController.setCamLog(params)
    })

    return res.status(200).json({ msg: 'Video apagado com sucesso' })
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
      multipleLeftJoin: [
        {
          nameNewField: 'locations.spaceCameras',
          table2Entity: SpaceCameras,
          table2Name: 'space_cameras',
          condition: 'locations.spaceId = space_cameras.space_id'
        },
        {
          nameNewField: 'locations.upload',
          table2Entity: Upload,
          table2Name: 'upload',
          condition: 'locations.id = upload.id_location'
        }
      ]
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
        const videos: ICams[] = []
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
              .then(() => {
                // achou o arquivo
                camUrl = `${global.camera.outputFolder.replace(
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

            let previewUrl = ''
            const nameArchivePreview =
              CamsController.generateNameArchive(
                cam.cameraAlias || '',
                cam.id,
                location.id
              ) + '-000_000.mp4'
            const previewPath = `${global.camera.preview}/${nameArchivePreview}`
            await fs.promises
              .access(previewPath)
              .then(() => {
                // achou o arquivo
                previewUrl = `${global.camera.preview.replace(
                  './',
                  '/'
                )}/${nameArchivePreview}`
              })
              .catch((error) => {
                // -- não achou o arquivo
                const paramsError = {
                  error: `Não encontramos o arquivo na pasta de preview ${global.camera.preview}, error:${error} `,
                  location: { ...location },
                  cam: { ...cam }
                }
                LogController.setAcessLog(paramsError, '/videos/:locationId')
                previewUrl = 'error: Não encontramos o arquivo de preview'
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
              id: cam.id,
              camId: cam.cameraId || '',
              camAlias: cam.cameraAlias || '',
              nameArchive: name,
              fileUrl: camUrl,
              previewFileUrl: previewUrl,
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
                cams: videos,
                upload: []
              })
            }

            return true
          })
        )

        return true
      })
    )

    // --  return upload
    await Promise.all(
      responseItens.map(async (item) => {
        const newItem = item
        const uploads: IUpload[] = []

        await Promise.all(
          locations.map(async (location: IReceiveConcatCams) => {
            if (item.id === location.id && location.upload.length > 0) {
              await Promise.all(
                location.upload.map(async (upload: Upload) => {
                  const filePath = `${global.camera.uploadFolderPreview.replace(
                    './',
                    '/'
                  )}/${upload.nameFile}`
                  const pathRealFile = `${global.camera.uploadFolderPreview}/${upload.nameFile}`
                  const newUpload: IUpload = {
                    ...upload,
                    filePath
                  }

                  if (
                    newUpload.processed === true &&
                    newUpload.preview === true
                  ) {
                    await fs.promises
                      .access(pathRealFile)
                      .then(() => {
                        uploads.push(newUpload)
                      })
                      .catch(() => {
                        // -- n faz nd
                      })
                  }

                  return item
                })
              )
            }

            return location
          })
        )

        newItem.upload = uploads

        return newItem
      })
    )

    return res.status(200).json(responseItens)
  }
}

export default new VideoController()
