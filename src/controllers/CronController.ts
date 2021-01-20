import DBController from './DBController'
import moment from 'moment-timezone'
import CamsController from './CamsController'
import LogController from './LogController'
import cron from 'node-cron'
import fs from 'fs'

// -- entity
import { Locations } from '../entity/gifplay/Locations'
import { SpaceCameras } from '../entity/gifplay/SpaceCameras'
import { Record } from '../entity/gifplay/Record'
import { Upload } from '../entity/gifplay/Upload'

interface IReceiveConcatCams extends Locations {
  spaceCameras: SpaceCameras[]
}

class CronController {
  constructor() {
    cron.schedule('* * * * *', async () => {
      // -- Executando a tarefa a cada 1 minuto
      console.log('Executando a tarefa a cada 1 minuto')
      await this.index()
      await this.verifyUploadVideo()
    })

    cron.schedule('0 0 */1 * *', async () => {
      // -- executa uma vez por dia.
      console.log('Executando a tarefa 2')
      setTimeout(() => {
        // atrasa a execusao em 1 min para que a variavel config seja carregada.
        this.clearDirVideo(
          global.camera.cut,
          global.camera.removeCutVideoTime,
          'mp4'
        )
        this.clearDirVideo(
          global.camera.outputFolder,
          global.camera.removeVideoTime,
          'mp4'
        )
      }, 1000)
    })

    setTimeout(() => this.verifyUploadVideo(), 1000)
  }

  private async verifyUploadVideo(): Promise<void> {
    const getParams = {
      table: 'upload',
      entity: Upload,
      where: 'processed = 0 LIMIT 1'
    }
    const uploadVideos = await DBController.get(getParams)

    Promise.all(
      uploadVideos.map(async (video: Upload) => {
        const pathVideo = `${global.camera.uploadFolder}/${video.nameFile}`

        console.log(pathVideo)

        await fs.promises
          .access(pathVideo)
          .then(() => {
            CamsController.convertVideoUpload(
              video.nameFile,
              pathVideo,
              video.idLocation,
              video.audio
            )
            const data: Upload = {
              ...video,
              processed: true
            }

            const paramsUpdate = {
              entity: Upload,
              data,
              where: `id = ${video.id}`
            }
            DBController.update(paramsUpdate)
          })
          .catch(() => {
            const paramsDelete = {
              entity: Upload,
              where: `id = ${video.id}`
            }
            DBController.delete(paramsDelete)
          })
      })
    )
  }

  private async index(): Promise<void> {
    await this.startRecordLocationsMovie()
    await this.stopRecordLocationsMovie()
  }

  private async clearDirVideo(
    repository: string,
    diasRemove: number,
    typeFile: string
  ): Promise<void> {
    fs.readdir(repository, (_, files) => {
      if (!files) {
        return false
      }
      files.forEach((file: string) => {
        const archiveExtension = String(file.split('.').pop())

        if (archiveExtension && archiveExtension.toLowerCase() === typeFile) {
          const fileDirectory = `${repository}${file}`
          fs.stat(`${repository}${file}`, (err, status) => {
            if (err) {
              throw err
            }

            const dateFile = moment(status.mtime)
            const dateRemoveFile = moment().subtract(diasRemove, 'd')

            if (dateFile <= dateRemoveFile) {
              try {
                // -- removeu arquivo
                fs.unlinkSync(fileDirectory)
              } catch (err) {
                console.error('error: ', err)
              }
            }
          })
        }
      })
    })
  }

  private async stopRecordLocationsMovie(): Promise<void> {
    // -- para as gravções se chegou o fim da locacao;
    const dateNow = moment().format('YYYY-MM-DD HH:mm')

    const params = {
      table: 'record',
      entity: Record,
      where: `date_end < "${dateNow}"`
    }
    const record = await DBController.get(params)
    record.map((item: Record) => {
      if (item.pid) {
        CamsController.stopRecordMovie(item.pid)
        const paramsDelete = {
          entity: Record,
          where: `id = ${item.id}`
        }
        DBController.delete(paramsDelete)
      }
      return item
    })
  }

  private async startRecordLocationsMovie(): Promise<void> {
    // -- busca as locacoes e aciona a funcao para gravar os videos.
    const dateNow = moment().format('YYYY-MM-DD HH:mm')
    const getParams = {
      table: 'locations',
      entity: Locations,
      where: `time_start <= "${dateNow}"
              AND time_end > "${dateNow}"
              AND ip <> ''
              AND port <> ''
              AND channel_default <> ''
              AND NOT EXISTS (SELECT 1
                FROM record
                WHERE  record.cam_id = space_cameras.id)`,
      leftJoin: {
        nameNewField: 'locations.spaceCameras',
        table2Entity: SpaceCameras,
        table2Name: 'space_cameras',
        condition: 'locations.spaceId = space_cameras.space_id'
      }
    }
    const locations = await DBController.get(getParams)
    const itensRecord: Record[] = []
    Promise.all(
      locations.map(async (location: IReceiveConcatCams) => {
        // -- dispara a funcao para gravar video de cada camera
        const { spaceCameras } = location

        await spaceCameras.map((cam: SpaceCameras) => {
          if (
            location.id &&
            cam.id &&
            cam.cameraAlias &&
            cam.ip &&
            cam.port &&
            cam.channelDefault
          ) {
            const pidCam = CamsController.getMovieCam({
              LocationID: location.id,
              ID: cam.id,
              name: cam.cameraAlias,
              IP: cam.ip,
              port: cam.port,
              channel: cam.channelDefault,
              tcp: cam.tcp,
              user: cam.userCam || '',
              password: cam.passwordCam || ''
            })

            // --  log de inicio de gravação
            pidCam.then((pid) => {
              const params = {
                camId: cam.id,
                locationId: location.id,
                log: `iniciando gravação da camera, pid: ${pid}`,
                success: true
              }
              LogController.setCamLog(params)

              // -- acrescenta um novo registro na tabela record
              const itemRecord: Record = {
                locationId: location.id,
                camId: cam.id,
                dateStart: location.timeStart,
                dateEnd: location.timeEnd,
                pid: pid
              }
              itensRecord.push(itemRecord)
            })
          } else {
            const params = {
              camId: cam.id,
              locationId: location.id,
              log:
                'A camera não está cadastrada de forma correta, falta informações para buscar o video'
            }
            LogController.setCamLog(params)
          }
        })

        return location
      })
    ).then(() => {
      // -- incrementa os itens na tabela de record.
      const getParams = {
        entity: Record,
        data: itensRecord
      }
      DBController.set(getParams)
    })
  }
}

export default new CronController()
