import { Request, Response } from 'express'

class CamerasController {
  public async index (req: Request, res: Response): Promise<Response> {
    return res.json({ type: 1 })
  }

  public teste (req: Request, res: Response): number {
    const teste = 8
    return teste
  }
}

export default new CamerasController()
