const slowFunction = () => {
  let counter = 0
  while (counter < 5000000000) {
    counter++
  }

  return counter
}

process.on('message', (message) => {
  console.log(' opa  ====', message)
  const dados = message
  if (message.start) {
    console.log('Child process received START message, index: ', dados.index)
    const slowResult = slowFunction()
    const message = `{"totalCount":${slowResult}}`
    process.send(message)
  }
})
