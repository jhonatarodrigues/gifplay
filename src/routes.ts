import { Request, Response, Router, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
const secret = 'meu-segredo' //esse segredo do JWT seria uma config

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
routes.get('/video/cut/download', verifyJWT, VideoController.getVideoCut)
routes.get('/video/cut', verifyJWT, VideoController.setVideoCut)
routes.get('/video/:locationId', verifyJWT, VideoController.getVideo)

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

//função que verifica se o JWT é ok
function verifyJWT(req: Request, res: Response, next: NextFunction) {
  var token = String(req.headers['x-access-token'])
  if (!token)
    return res
      .status(401)
      .send({ auth: false, message: 'Token não informado.' })

  jwt.verify(token, secret, function (err: any, decoded: any) {
    if (err)
      return res.status(500).send({ auth: false, message: 'Token inválido.' })

    // req.userId = decoded.id;
    // console.log("User Id: " + decoded.id)
    next()
  })
}

export default routes
