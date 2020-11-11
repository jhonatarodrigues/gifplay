import { Request, Response } from 'express'

class CronController {
  public index (req: Request, res: Response):Promise<Response> {
    return res.json({ response: 'aaaa' })
  }
}

export default new CronController()
