import { Request, Response } from 'express'
import { spawn } from 'child_process'
import Kill from 'tree-kill'
import LogController from './LogController'
import { getVideoDurationInSeconds } from 'get-video-duration'
import fs from 'fs'

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
      console.log(path)

      await fs.promises
        .access(path)
        .then((response) => {
          // achou o arquivo
          console.log('achouuuu')
          const local = `${global.url}/${path.replace('./', '')}`
          arrayThumbs.push(local)
        })
        .catch(() => {
          // -- nao faz nd
        })
    }

    return arrayThumbs
  }

  public async generateThumbs(name: string, id: number, locationId: number) {
    console.log(`generate thumbs`)
    const concatNameArchive = `${this.generateNameArchive(
      name,
      id,
      locationId
    )}-000`

    getVideoDurationInSeconds(
      `${global.camera.outputFolder}${concatNameArchive}.mp4`
    ).then((duration) => {
      let numberThumbs = 10
      if (duration < 20) {
        numberThumbs = 3
      } else if (duration < 6) {
        numberThumbs = 1
      }

      const args = [
        '-i',
        `${global.camera.outputFolder}${concatNameArchive}.mp4`,
        '-vf',
        `select='not(mod(t,${Math.trunc(duration)}/${numberThumbs}))'`,
        '-vsync',
        'vfr',
        `${global.camera.thumbs}${concatNameArchive}_%03d.jpg`
      ]

      const ffmpeg = spawn('ffmpeg', args)
      ffmpeg.stderr.setEncoding('utf8')
      ffmpeg.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`)
      })

      ffmpeg.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`)
      })
      ffmpeg.on('error', (err) => {
        // -- error process
        const params = {
          camId: id,
          locationId: locationId,
          log: `ffmpeg: erro ao gerar thumbs do video: ${concatNameArchive}, error: ${err}`
        }
        LogController.setCamLog(params)
      })
      ffmpeg.on('close', (code) => {
        const params = {
          camId: id,
          locationId: locationId,
          log: `Fim da geração de thumbs, video: ${concatNameArchive}`,
          success: true
        }
        LogController.setCamLog(params)
      })

      console.log(duration)
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

    let tcpTransport: any[] = []
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
      '-c:v',
      'libx264',
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
      `${global.camera.outputFolder}${concatNameArchive}-%03d.mp4`
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
      const params = {
        camId: ID,
        locationId: LocationID,
        log: `fim da gravação da camera, pid: ${ffmpeg.pid}, code: ${code}`,
        success: true
      }
      LogController.setCamLog(params)
      this.generateThumbs(name, ID, LocationID)
    })

    return ffmpeg.pid
  }

  public stopRecordMovie(pid: number) {
    Kill(pid)
  }
}

export default new CamsController()
