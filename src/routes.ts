import { Router } from 'express'

// -- controllers
import CamsController from './controllers/CamsController'

const routes = Router()

routes.get('/', (req, res) => {
  return res.send('hello demorando ')
})

routes.get('/cameras', CamsController.index)

export default routes
