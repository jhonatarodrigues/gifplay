import { Request, Response } from 'express'

import Recorder, { RecorderEvents } from 'rtsp-video-recorder'
import readline from 'readline'

class CamerasController {
  public async index (req: Request, res: Response): Promise<Response> {
    return res.json({ type: 1 })
  }

  public teste (req: Request, res: Response):void {
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
      // const {
      //   IP,
      //   TITLE,
      //   SEGMENT_TIME,
      //   THRESHOLD,
      //   FILE_PATTERN,
      //   AUTO_CLEAR,
      //   DESTINATION
      // // } = process.env

      // if (!IP || !DESTINATION) {
      //   throw new Error('You have to specify at least IP & DESTINATION.')
      // }

      const title = 'Example cam'
      const segmentTime = '5m'
      const dirSizeThreshold = '500M'
      const autoClear = false
      const filePattern = `%Y.%m.%d/%H.%M.%S-${title}`
      const DESTINATION = './videos'
      const IP = '192.168.15.13'

      const recorder = new Recorder(
        `rtsp://${IP}:5554/camera`, DESTINATION,
        {
          title,
          segmentTime,
          filePattern,
          dirSizeThreshold,
          autoClear
        }
      )

      recorder.on(RecorderEvents.STARTED, log(RecorderEvents.STARTED))
        .on(RecorderEvents.STOPPED, log(RecorderEvents.STOPPED))
        .on(RecorderEvents.ERROR, log(RecorderEvents.ERROR))
        .on(RecorderEvents.SEGMENT_STARTED, log(RecorderEvents.SEGMENT_STARTED))
        .on(RecorderEvents.FILE_CREATED, log(RecorderEvents.FILE_CREATED))
        .on(RecorderEvents.STOP, log(RecorderEvents.STOP))
      // .on(RecorderEvents.PROGRESS, log(RecorderEvents.PROGRESS))
        .on(RecorderEvents.SPACE_FULL, log(RecorderEvents.SPACE_FULL))
        .on(RecorderEvents.SPACE_WIPED, log(RecorderEvents.SPACE_WIPED))
        .start()

      process.stdin.on('keypress', (_, key) => {
        if (key.ctrl && key.name === 'c') {
          if (recorder.isRecording()) {
            recorder
              .on(RecorderEvents.STOPPED, () => {
                setTimeout(() => {
                  console.log('Gracefully stopped.')
                  process.exit()
                }, 2000)
              })
              .stop()
          } else {
            process.exit()
          }
        } else if (key.name === 'space') {
          if (recorder.isRecording()) {
            recorder.stop()
          } else {
            recorder.start()
          }
        }
      })
      console.log('Press "space" to start/stop recording, "ctrl + c" to stop a process.')
      console.log()
    } catch (err) {
      console.error(err)
    }
  }
}

export default new CamerasController()
