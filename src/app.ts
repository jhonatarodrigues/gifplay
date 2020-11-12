import express from 'express'
import cors from 'cors'
import routes from './routes'
import 'reflect-metadata'
import * as bodyParser from 'body-parser'
import DBController from './controllers/DBController'

class App {
  public express: express.Application

  public constructor () {
    DBController.connection()
    this.express = express()
    this.middlewares()
    this.routes()
  }

  private middlewares (): void {
    this.express.use(bodyParser.json())
    this.express.use(cors())
  }

  private routes (): void {
    this.express.use(routes)
  }
}

export default new App().express
