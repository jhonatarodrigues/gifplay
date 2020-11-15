import { Router } from 'express'

// -- controllers
import VideoController from './controllers/VideoController'

const routes = Router()

routes.get('/', (req, res) => {
  return res.send('hello demorando ')
})

//-- video
routes.get('/video/:locationId', VideoController.getVideo)

export default routes
