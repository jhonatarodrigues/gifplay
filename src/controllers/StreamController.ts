import { Request, Response } from 'express'
import fs from 'fs'

class StreamController {
  public async getStream(req: Request, res: Response): Promise<any> {
    // -- incrementa o log de cameras

    const { query } = req

    console.log('stream ==', query.path)
    if (!query.path) {
      return res.status(206).json({
        msg: 'Envie todos os parametros.'
      })
    }

    /// -- stream
    const path = `.${String(query.path)}`

    fs.stat(path, (err, stat) => {
      if (err !== null && err.code === 'ENOENT') {
        res.sendStatus(404)
      }

      const fileSize = stat.size
      const range = req.headers.range

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunksize = end - start + 1
        const file = fs.createReadStream(path, { start, end })
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4'
        }

        res.writeHead(206, head)
        file.pipe(res)
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4'
        }

        res.writeHead(200, head)
        fs.createReadStream(path).pipe(res)
      }
    })

    return res.status(500)
  }
}

export default new StreamController()
