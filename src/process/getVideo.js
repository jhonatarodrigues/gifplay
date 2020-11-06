const buscaVideo = () => {
  const nome = 'Example cam'
  const IP = '192.168.15.13'
  const ID = 123
  const porta = 5554
  const usuario = ''
  const senha = ''

  /// / ----

  const log = (event) => (...args) => {
    console.log(new Date().toString())
    console.log(`Event "${event}": `, ...args)
    console.log()
  }

  // readline.emitKeypressEvents(process.stdin)
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true)
  }

  try {
    const filePattern = `${ID}-%Y.%m.%d-%H.%M.%S-${nome}`
    const DESTINATION = './videos'
    let url = `rtsp://${IP}:${porta}/`
    if (usuario && senha) {
      url = `rtsp://${usuario}:${senha}@${IP}:${porta}/`
    }

    const recorder = new Recorder(url, DESTINATION, {
      title: nome,
      segmentTime: global.camera.tempoMaximoDeCadaArquivo,
      filePattern,
      dirSizeThreshold: global.camera.tamanhoMaximoDeCadaArquivo,
      autoClear: global.camera.limparAutomaticamente
    })

    recorder
      .on(RecorderEvents.STARTED, log(RecorderEvents.STARTED))
      .on(RecorderEvents.STOPPED, log(RecorderEvents.STOPPED))
      .on(RecorderEvents.ERROR, log(RecorderEvents.ERROR))
      .on(RecorderEvents.SEGMENT_STARTED, log(RecorderEvents.SEGMENT_STARTED))
      .on(RecorderEvents.FILE_CREATED, log(RecorderEvents.FILE_CREATED))
      .on(RecorderEvents.STOP, log(RecorderEvents.STOP))
      // .on(RecorderEvents.PROGRESS, log(RecorderEvents.PROGRESS))
      .on(RecorderEvents.SPACE_FULL, log(RecorderEvents.SPACE_FULL))
      .on(RecorderEvents.SPACE_WIPED, log(RecorderEvents.SPACE_WIPED))
      .start()

    setTimeout(() => {
      recorder
        .on(RecorderEvents.STOPPED, () => {
          setTimeout(() => {
            console.log('Gracefully stopped.')
            process.exit()
          }, 2000)
        })
        .stop()
    }, 10000)
  } catch (err) {
    console.error(err)
  }
}

process.on('buscaVideo', (message) => {
  console.log(' opa  ====', message)
  const dados = message
  if (message.start) {
    console.log('Child process received START buscaVideo, index: ', dados.index)
    // const slowResult = buscaVideo()
    const slowResult = 'aaaa'

    const message = `{"totalCount":${slowResult}}`
    process.send(message)
  }
})
