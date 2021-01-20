import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import routes from './routes'
import * as bodyParser from 'body-parser'
import DBController from './controllers/DBController'
import CronController from './controllers/CronController'
import morgan from 'morgan'

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
    this.express.use(
      morgan(
        ':method :url :status :response-time ms - Length: :res[content-length]'
      )
    )
    this.express.use(routes)

    // -- trata erro do multer, vulgo arquivo grande
    this.express.use(function (
      err: Error,
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      if (err.message === 'File too large') {
        res.status(413).send(err.message)
        res.end('')
      }
    })
  }
}

export default new App().express
