import {} from './DBController'

class LogController {
  public async connection ():Promise<void> {
    console.log('log controller ===')
  }

  public async setCamLog (): Promise<void> {
    // -- incrementa o log de cameras
  }
}

export default new LogController()
