import express from 'express'
import cors from 'cors'
import routes from './routes'
import * as bodyParser from 'body-parser'
import DBController from './controllers/DBController'
import CronController from './controllers/CronController'

class App {
  public express: express.Application

  public constructor() {
    DBController.connection()
    CronController
    this.express = express()
    this.middlewares()
    this.routes()
  }

  private middlewares(): void {
    this.express.use(bodyParser.json())
    this.express.use(cors())
  }

  private routes(): void {
    this.express.use(routes)
  }
}

export default new App().express
