import { Request, Response } from 'express'
import { spawn } from 'child_process'
import Kill from 'tree-kill'
import LogController from './LogController'

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

  private tratName(val: string): string {
    const newVal = val.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')

    return newVal
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
    const concatNameArchive = this.tratName(`${name}${ID}${LocationID}`)

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
    })

    setTimeout(() => {
      Kill(ffmpeg.pid)
    }, 30000)

    return ffmpeg.pid
  }

  public stopRecordMovie(pid: number) {
    Kill(pid)
  }
}

export default new CamsController()
