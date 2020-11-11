// -- cams
declare namespace NodeJS {
  interface Global {
      camera: {
        diretorioPasta: string,
        tempoMaximoDeCadaArquivo: string,
        tamanhoMaximoDeCadaArquivo: string,
        limparAutomaticamente: boolean
      }
  }
}
