import { Request, Response, Router, NextFunction } from 'express'
import jwt from 'jsonwebtoken' // esse segredo do JWT seria uma config
import multer from 'multer'

// -- controllers
import VideoController from './controllers/VideoController'
import path from 'path'
import fs from 'fs'
const secret = 'cleytonmota'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, global.camera.uploadFolder)
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split('.').pop()
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension)
  }
})

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    const ext = path.extname(file.originalname)
    if (ext !== '.mp4') {
      return callback(new Error('Só é permitido arquivo mp4'))
    }
    callback(null, true)
  },
  limits: {
    fileSize: 1 * 1024 * 1024 * 1024
  }
})
const mime: any = {
  jpg: 'image/jpeg'
}
const routes = Router()

routes.get('/', (req, res) => {
  return res.send('Gifplay Api')
})

// -- video
routes.get('/video/cut/download', VideoController.getVideoCut)
routes.get('/video/cut', VideoController.setVideoCut)
routes.get('/video/:locationId', VideoController.getVideo)

// -- send file
routes.post(
  '/video/sendFile',
  upload.single('file'),
  VideoController.setSendFile
)

// routes.get('/teste', (req: Request, res: Response) => {
//   const token = jwt.sign(
//     {
//       auth: 'magic',
//       outro: 'sla',
//       outro2: 'sla',
//       outro3: 'sla',
//       agent: req.headers['user-agent'],
//       exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60 // Note: in seconds!
//     },
//     secret
//   ) // secret is defined in the environment variable JWT_SECRET

//   return res.status(200).json({ aa: 'aaaa', token })
// })

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

// função que verifica se o JWT é ok
// function verifyJWT (req: Request, res: Response, next: NextFunction) {
//   const token = String(req.headers['x-access-token'])

//   console.log('toekn ', token)

//   if (!token) {
//     return res
//       .status(401)
//       .send({ auth: false, message: 'Token não informado.' })
//   }

//   jwt.verify(token, secret, function (err: any, decoded: any) {
//     console.log(' === token', err, decoded)
//     if (err) {
//       return res.status(500).send({ auth: false, message: 'Token inválido.' })
//     }

//     // req.userId = decoded.id;
//     // console.log("User Id: " + decoded.id)
//     next()
//   })
// }

export default routes
