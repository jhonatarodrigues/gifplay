import { Router } from 'express'
var path = require('path')
var fs = require('fs')

var dir = path.join(__dirname, 'public')

var mime: any = {
  jpg: 'image/jpeg'
}

// -- controllers
import VideoController from './controllers/VideoController'

const routes = Router()

routes.get('/', (req, res) => {
  return res.send('hello demorando ')
})

//-- video
routes.get('/video/cut', VideoController.setVideoCut)
routes.get('/video/:locationId', VideoController.getVideo)

routes.get('*', function (req, res) {
  const dirPath = './'
  var file = path.join(dirPath, req.path.replace(/\/$/, '/index.html'))
  var type = mime[path.extname(file).slice(1)] || 'text/plain'
  var s = fs.createReadStream(file)

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
