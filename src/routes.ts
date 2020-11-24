import { Router } from 'express'
import CronController from './controllers/CronController'

// -- controllers
import VideoController from './controllers/VideoController'
import path from 'path'
import fs from 'fs'

const mime: any = {
  jpg: 'image/jpeg'
}

const routes = Router()

routes.get('/', (req, res) => {
  return res.send('hello demorando ')
})

// -- video
routes.get('/video/cut/download', VideoController.getVideoCut)
routes.get('/video/cut', VideoController.setVideoCut)
routes.get('/video/:locationId', VideoController.getVideo)

routes.get('*', function (req, res) {
  const dirPath = './'
  const file = path.join(dirPath, req.path.replace(/\/$/, '/index.html'))
  const type = mime[path.extname(file).slice(1)] || 'text/plain'
  const s = fs.createReadStream(file)

  s.on('open', function () {
    res.set('Content-Type', type)
    s.pipe(res)
  })
  s.on('error', function () {
    res.set('Content-Type', 'text/plain')
    res.status(404).end('Not found')
  })
})

export default routes
