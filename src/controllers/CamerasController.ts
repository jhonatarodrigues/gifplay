import { Request, Response } from 'express'
import { spawn } from 'child_process'
import Kill from 'tree-kill'

interface videoRtsp {
  ID: number,
  nome: string,
  IP: string,
  porta: number,
  usuario?: string,
  senha?: string
}
class CamerasController {
  public async index (req: Request, res: Response): Promise<Response> {
    return res.json({ type: 1 })
  }

  public async buscaVideoCamera (req: Request, res: Response):Promise<Response> {
    const name = 'Example cam'
    const IP = '192.168.15.13'
    const comentArchive = '"gifplay video"'

    for (let i = 0; i < 1; i++) {
      const args = [
        '-rtsp_transport', 'tcp',
        // '-i', `rtsp://${IP}:5554/`,
        '-i', 'rtsp://api:Api1010G@poliesportes.ddns.net:1082/cam/realmonitor?channel=1&subtype=0',
        '-c', 'copy',
        '-timeout', '30000',
        '-c:v', 'libx264',
        '-map', '0',
        '-preset', 'veryslow',
        '-b', '100k',
        '-r', '24', // -- frames
        '-crf', '28', /// -- qualidade do video, default 23 quanto maior o numero pior a qualidade
        '-threads', '2',
        '-metadata', `title=${name}${i}`,
        '-metadata', `comment=${comentArchive}`,
        '-f', 'segment',
        '-segment_time', '82800',
        '-segment_format', 'mp4', '-an', `./videos/capture${i}-%03d.mp4`
      ]

      const ffmpeg = spawn('ffmpeg', args)

      ffmpeg.stderr.setEncoding('utf8')
      ffmpeg.stderr.on('data', (data) => {
        console.log(data)
      })
      ffmpeg.stdout.on('data', function (data) {
        console.log(data)
      })
      ffmpeg.on('close', function () {
        console.log('finished')
      })

      setTimeout(() => {
        Kill(ffmpeg.pid)
      }, 60000)
    }

    return res.json({ response: 1 })
  }
}

export default new CamerasController()
