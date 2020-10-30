import { Router } from 'express'

// -- controllers
import CamerasController from './controllers/CamerasController'

const routes = Router()

routes.get('/', (req, res) => {
  return res.send('hello demorando ')
})

routes.get('/cameras', CamerasController.index)

routes.get('/teste', CamerasController.teste)

export default routes
