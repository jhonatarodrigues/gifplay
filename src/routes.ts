import { Router } from 'express'

// -- controllers
import CamerasController from './controllers/CamerasController'
import CronController from './controllers/CronController'

const routes = Router()

routes.get('/', (req, res) => {
  return res.send('hello demorando ')
})

routes.get('/cameras', CamerasController.index)

routes.get('/cron', CronController.index.bind(CronController))

export default routes
