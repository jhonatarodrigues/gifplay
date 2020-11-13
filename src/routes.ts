import { Router } from 'express'

// -- controllers
import CamsController from './controllers/CamsController'
import CronController from './controllers/CronController'

const routes = Router()

routes.get('/', (req, res) => {
  return res.send('hello demorando ')
})

routes.get('/cameras', CamsController.index)

routes.get('/cron', CronController.index.bind(CronController))

export default routes
