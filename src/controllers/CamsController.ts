import { Request, Response } from 'express'
import { spawn } from 'child_process'
import Kill from 'tree-kill'
import LogController from './LogController'
import { getVideoDurationInSeconds } from 'get-video-duration'
import fs from 'fs'
import moment from 'moment-timezone'
import DBController from './DBController'
import { Record } from '../entity/gifplay/Record'
import axios from 'axios'

interface videoRtsp {
  LocationID: number
  ID: number
  name: string
  IP: string
  port: number
  channel: string
  tcp: boolean
  user?: string
  password?: string
}

interface returnCutVideo {
  status: number
  msg: string
}
class CamsController {
  public async index(req: Request, res: Response): Promise<Response> {
    return res.json({ type: 1 })
  }

  public generateNameArchive(
    name: string,
    id: number,
    locationId: number
  ): string {
    const val = `${name}${id}${locationId}`
    const newVal = val.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')

    return newVal
  }

  public async getCutVideo(transactionId: string): Promise<string> {
    const concatNameArchive = `${transactionId}`

    const archiveCutName = `${concatNameArchive}-000.mp4`
    const videoFinal = `${global.camera.cut}${archiveCutName}`
    let urlVideo = ''
    await fs.promises
      .access(videoFinal)
      .then(() => {
        urlVideo = `${global.url}/${videoFinal.replace('./', '')}`
      })
      .catch(() => {
        /* == file not exist */
      })

    return urlVideo
  }

  public async cutVideo(
    name: string,
    camId: number,
    locationId: number,
    startCut: number,
    secondsCut: number,
    transactionId: string
  ): Promise<returnCutVideo> {
    const concatNameArchive = `${this.generateNameArchive(
      name,
      camId,
      locationId
    )}`

    const params = {
      camId: camId,
      locationId: locationId,
      log: `Inicio de corte de video: ${concatNameArchive}, start:${startCut}, end: ${secondsCut}`,
      success: true
    }
    LogController.setCamLog(params)

    const start = moment(moment().format('YYYY-MM-DD')).add(startCut, 'seconds')
    const end = moment(moment().format('YYYY-MM-DD')).add(secondsCut, 'seconds')
    const archiveCutName = `${transactionId}-000.mp4`
    const secondsAfterStart = end.seconds()
    const dateSecondsAfterStart = end.format('HH:mm:ss')
    const videoFinal = `${global.camera.cut}${archiveCutName}`
    const msgVideoExiste = await this.getCutVideo(transactionId)
    if (msgVideoExiste) {
      return {
        status: 200,
        msg: 'O Video já está cortado, acesse o end-point de request e busque-o'
      }
    }

    if (secondsAfterStart > global.camera.maxTimeCutSeconds) {
      return {
        status: 206,
        msg: `Você não pode cortar mais de ${global.camera.maxTimeCutSeconds} segundos de video.`
      }
    }

    const args = [
      '-ss',
      `${start.format('HH:mm:ss')}`,
      '-i',
      `${global.camera.outputFolder}${concatNameArchive}-000.mp4`,
      '-to',
      `${dateSecondsAfterStart}`,
      '-async',
      '1',
      videoFinal
    ]

    console.log('args cut', args)

    const ffmpeg = spawn('ffmpeg', args, {
      shell: true
    })
    ffmpeg.stderr.setEncoding('utf8')
    ffmpeg.on('error', (err) => {
      // -- error process
      const params = {
        camId: camId,
        locationId: locationId,
        log: `ffmpeg: erro ao cortar o video: ${concatNameArchive}, error: ${err}`
      }
      LogController.setCamLog(params)
    })
    ffmpeg.on('close', () => {
      const params = {
        camId: camId,
        locationId: locationId,
        log: `Fim do corte do video: ${concatNameArchive}, start:${startCut}, end: ${secondsCut}`,
        success: true
      }
      LogController.setCamLog(params)

      const header = {
        headers: {
          Authorization: process.env.AUTH_ONSIGN
        }
      }
      const data = {
        app_id: process.env.APP_ID_ONSIGN,
        contents: {
          en: 'Teste de notificação'
        },
        data: { transactionid: `${transactionId}` },
        headings: {
          en: 'Gifplay'
        },
        filters: [
          {
            field: 'tag',
            key: 'transactionid',
            relation: '=',
            value: `${transactionId}`
          }
        ],
        android_group: 'gifplay',
        android_group_message: {
          en: '$[notif_count] Novos eventos detectados'
        },
        thread_id: 'gifplay',
        summary_arg: { en: '$[notif_count] Novos eventos detectados' },
        android_visibility: 1,
        collapse_id: 'gifplay-video',
        priority: 10
      }
      console.log('envio onsign', data, header)
      axios
        .post('https://onesignal.com/api/v1/notifications', data, header)
        .then((response) => {
          console.log('response onsign ===', response.data)
          const params = {
            camId: camId,
            locationId: locationId,
            log: `Envio do post para onsign: ${JSON.stringify(response.data)}`,
            success: true
          }
          LogController.setCamLog(params)
        })
        .catch((error) => {
          const params = {
            camId: camId,
            locationId: locationId,
            log: `Erro ao enviar post para onsign: ${error}`,
            success: false
          }
          LogController.setCamLog(params)
        })
    })

    return {
      status: 200,
      msg: 'em processo de corte, aguarde para fazer o donwload.'
    }
  }

  public async getThumbs(
    name: string,
    id: number,
    locationId: number
  ): Promise<string[]> {
    const concatNameArchive = `${this.generateNameArchive(
      name,
      id,
      locationId
    )}`

    const arrayThumbs: string[] = []
    for (let index = 1; index <= 10; index++) {
      const num = index <= 9 ? `00${index}` : `0${index}`
      const path = `${global.camera.thumbs}${concatNameArchive}-000_${num}.jpg`

      await fs.promises
        .access(path)
        .then(() => {
          // achou o arquivo
          const local = `${global.url}/${path.replace('./', '')}`
          arrayThumbs.push(local)
        })
        .catch(() => {
          // -- nao faz nd
        })
    }

    return arrayThumbs
  }

  private async generateThumbs(name: string, id: number, locationId: number) {
    const concatNameArchive = `${this.generateNameArchive(
      name,
      id,
      locationId
    )}-000`

    getVideoDurationInSeconds(
      `${global.camera.outputFolder}${concatNameArchive}.mp4`
    ).then((duration) => {
      const duracao = Math.trunc(duration)
      let numberThumbs: number[] = [10, 20, 30, 40, 50, 60, 70, 80, 89, 95]
      if (duracao < 20) {
        numberThumbs = [30, 60, 90]
      }

      const params = {
        camId: id,
        locationId: locationId,
        log: `iniciando a criação de thumbs do video: ${concatNameArchive}.mp4 são ${numberThumbs.length} thumbs`,
        success: true
      }
      LogController.setCamLog(params)

      numberThumbs.map((num: number, index) => {
        const segundo = (duracao * num) / 100
        const tempo = moment(moment().format('YYYY-MM-DD'))
          .add(segundo, 'seconds')
          .format('HH:mm:ss')
        const newIndex = index + 1
        const numArchive = newIndex <= 9 ? `00${newIndex}` : `0${newIndex}`
        const args = [
          '-i',
          `${global.camera.outputFolder}${concatNameArchive}.mp4`,
          '-ss',
          `${tempo}`,
          '-vframes',
          '1',
          `${global.camera.thumbs}${concatNameArchive}_${numArchive}.jpg`
        ]

        const ffmpeg = spawn('ffmpeg', args)
        ffmpeg.stderr.setEncoding('utf8')

        ffmpeg.on('error', (err) => {
          // -- error process
          const params = {
            camId: id,
            locationId: locationId,
            log: `ffmpeg: erro ao gerar thumbs${index} do video: ${concatNameArchive}, error: ${err}`
          }
          LogController.setCamLog(params)
        })
        ffmpeg.on('close', () => {
          const params = {
            camId: id,
            locationId: locationId,
            log: `Fim da geração de thumbs${index} do video: ${concatNameArchive}`,
            success: true
          }
          LogController.setCamLog(params)
        })

        return num
      })
    })
  }

  public async generatePreview(name: string, id: number, locationId: number) {
    const concatNameArchive = `${this.generateNameArchive(
      name,
      id,
      locationId
    )}-000`

    const args = [
      '-y',
      '-i',
      `${global.camera.outputFolder}${concatNameArchive}.mp4`,
      '-crf',
      '36',
      '-preset',
      'slow',
      '-vf',
      'scale=320:240',
      '-an',
      `${global.camera.preview}/${concatNameArchive}_000.mp4`
    ]

    const ffmpeg = spawn('ffmpeg', args)
    ffmpeg.stderr.setEncoding('utf8')

    ffmpeg.on('error', (err) => {
      // -- error process
      const params = {
        camId: id,
        locationId: locationId,
        log: `ffmpeg: erro ao gerar preview do video: ${concatNameArchive}, error: ${err}`
      }
      LogController.setCamLog(params)
    })
    ffmpeg.on('close', () => {
      const params = {
        camId: id,
        locationId: locationId,
        log: `Fim da geração do preview do video: ${concatNameArchive}`,
        success: true
      }
      LogController.setCamLog(params)
    })
  }

  public async getMovieCam({
    LocationID,
    ID,
    name,
    IP,
    port,
    channel,
    tcp,
    user,
    password
  }: videoRtsp): Promise<number> {
    const comentArchive = `"gifplay video - ${ID} "`
    const userPassword = user && password ? `${user}:${password}@` : ''
    const url = `rtsp://${userPassword}${IP}:${port}${channel}`
    const concatNameArchive = this.generateNameArchive(name, ID, LocationID)

    let tcpTransport: string[] = []
    if (tcp) {
      tcpTransport = ['-rtsp_transport', 'tcp']
    }
    let args = [
      '-i',
      url,
      '-c',
      'copy',
      '-timeout',
      global.camera.timeout,
      // '-c:v',
      // 'libx264',
      '-map',
      '0',
      '-preset',
      'veryslow',
      '-b',
      '100k',
      '-r',
      '24', // -- frames
      '-crf',
      global.camera.videoQuality, /// -- qualidade do video, default 23 quanto maior o numero pior a qualidade
      '-threads',
      '2',
      '-metadata',
      `title=GifPlay-${concatNameArchive}`,
      '-metadata',
      `comment=${comentArchive}`,
      '-f',
      'segment',
      '-segment_time',
      global.camera.maxTimeRecord,
      '-segment_format',
      'mp4',
      '-an',
      `${global.camera.outputFolder}${concatNameArchive}-%03dnoMark.mp4`
    ]
    args = [...tcpTransport, ...args]

    // -- ffmpeg através de preocessos
    const ffmpeg = spawn('ffmpeg', args)
    ffmpeg.stderr.setEncoding('utf8')
    ffmpeg.on('error', (err) => {
      // -- error process
      const params = {
        camId: ID,
        locationId: LocationID,
        log: `ffmpeg: erro na gravação da camera, error: ${err}`
      }
      LogController.setCamLog(params)
    })
    ffmpeg.on('close', (code) => {
      // -- close process
      if (code !== 255) {
        const paramsDelete = {
          entity: Record,
          where: `pid = ${ffmpeg.pid}`
        }
        DBController.delete(paramsDelete)
      }
      const params = {
        camId: ID,
        locationId: LocationID,
        log: `fim da gravação da camera, pid: ${ffmpeg.pid}, code: ${code}`,
        success: true
      }
      LogController.setCamLog(params)
      if (code === 255) {
        this.addWaterMarkInVideo(name, ID, LocationID, () => {
          setTimeout(() => {
            this.generateThumbs(name, ID, LocationID)
            setTimeout(() => {
              this.generatePreview(name, ID, LocationID)
            }, 30000)
          }, 30000)
        })
      }
    })

    return ffmpeg.pid
  }

  private async addWaterMarkInVideo(
    name: string,
    id: number,
    locationId: number,
    callback: () => void
  ) {
    const concatNameArchive = `${this.generateNameArchive(
      name,
      id,
      locationId
    )}-000`

    const params = {
      camId: id,
      locationId: locationId,
      log: `inicio da geração do video com marca d agua: ${concatNameArchive}`,
      success: true
    }
    LogController.setCamLog(params)

    let logoGifplay = './images/logoGifplay.png'
    await fs.promises
      .access(logoGifplay)
      .then(() => {
        // -- faz nd
      })
      .catch(() => {
        logoGifplay = './src/images/logoGifplay.png'
      })

    const video = `${global.camera.outputFolder}${concatNameArchive}noMark.mp4`

    const args = [
      '-y',
      '-i',
      video,
      '-i',
      logoGifplay,
      '-filter_complex',
      'overlay=main_w-overlay_w-10:main_h-overlay_h-10',
      '-an',
      `${global.camera.outputFolder}/${concatNameArchive}.mp4`
    ]

    const ffmpeg = spawn('ffmpeg', args)
    ffmpeg.stderr.setEncoding('utf8')
    ffmpeg.on('error', (err) => {
      // -- error process
      const params = {
        camId: id,
        locationId: locationId,
        log: `ffmpeg: erro ao gerar video com marca d água: ${concatNameArchive}, error: ${err}`
      }
      LogController.setCamLog(params)
    })
    ffmpeg.on('close', () => {
      const params = {
        camId: id,
        locationId: locationId,
        log: `Fim da geração do video com marca d agua: ${concatNameArchive}`,
        success: true
      }
      LogController.setCamLog(params)

      fs.unlink(video, () => {
        // removido
        const params = {
          camId: id,
          locationId: locationId,
          log: `apagado arquivo: ${concatNameArchive}`,
          success: true
        }
        LogController.setCamLog(params)

        callback()
      })
    })
  }

  public stopRecordMovie(pid: number) {
    Kill(pid)
  }
}

export default new CamsController()
