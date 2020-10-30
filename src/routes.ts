import { Router } from 'express'

// -- controllers
import CamerasController from './controllers/CamerasController'

const routes = Router()

routes.get('/', (req, res) => {
  return res.send('hello demorando ')
})

routes.get('/cameras', CamerasController.index)

routes.get('/teste', (req, res) => {
  return res.send('teste ')
})

export default routes
