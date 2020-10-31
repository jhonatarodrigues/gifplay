import { Request, Response } from 'express'
import Recorder, { RecorderEvents } from 'rtsp-video-recorder'
import readline from 'readline'

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

    console.log('carai vei')

    this.getVideoRtsp({
      ID: 123,
      nome: name,
      IP,
      porta: 5554
    })

    return res.json({ vaicarai: 1 })
  }

  private getVideoRtsp ({ ID, nome, IP, porta, usuario, senha }: videoRtsp): void {
    const log = (event: string) => (...args: any[]) => {
      console.log(new Date().toString())
      console.log(`Event "${event}": `, ...args)
      console.log()
    }

    readline.emitKeypressEvents(process.stdin)
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true)
    }

    try {
      const filePattern = `${ID}-%Y.%m.%d-%H.%M.%S-${nome}`
      const DESTINATION = './videos'
      let url = `rtsp://${IP}:${porta}/`
      if (usuario && senha) {
        url = `rtsp://${usuario}:${senha}@${IP}:${porta}/`
      }

      const recorder = new Recorder(
        url, DESTINATION,
        {
          title: nome,
          segmentTime: global.camera.tempoMaximoDeCadaArquivo,
          filePattern,
          dirSizeThreshold: global.camera.tamanhoMaximoDeCadaArquivo,
          autoClear: global.camera.limparAutomaticamente
        }
      )

      recorder.on(RecorderEvents.STARTED, log(RecorderEvents.STARTED))
        .on(RecorderEvents.STOPPED, log(RecorderEvents.STOPPED))
        .on(RecorderEvents.ERROR, log(RecorderEvents.ERROR))
        .on(RecorderEvents.SEGMENT_STARTED, log(RecorderEvents.SEGMENT_STARTED))
        .on(RecorderEvents.FILE_CREATED, log(RecorderEvents.FILE_CREATED))
        .on(RecorderEvents.STOP, log(RecorderEvents.STOP))
        .on(RecorderEvents.PROGRESS, log(RecorderEvents.PROGRESS))
        .on(RecorderEvents.SPACE_FULL, log(RecorderEvents.SPACE_FULL))
        .on(RecorderEvents.SPACE_WIPED, log(RecorderEvents.SPACE_WIPED))
        .start()

      setTimeout(() => {
        recorder
          .on(RecorderEvents.STOPPED, () => {
            setTimeout(() => {
              console.log('Gracefully stopped.')
              process.exit()
            }, 2000)
          })
          .stop()
      }, 10000)
      console.log()
    } catch (err) {
      console.error(err)
    }
  }
}

export default new CamerasController()
