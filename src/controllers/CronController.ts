import { Request, Response } from 'express'
import DBController from './DBController'

class CronController {
  constructor () {
    const a = DBController
    console.log(a)
  }

  public index (req: Request, res: Response):Response {
    return res.json({ response: 'aaaa' })
  }
}

export default new CronController()
