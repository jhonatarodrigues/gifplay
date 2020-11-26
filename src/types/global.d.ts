// -- cams
declare namespace NodeJS {
  interface Global {
    camera: {
      outputFolder: string
      thumbs: string
      cut: string
      timeout: string
      maxTimeRecord: string
      videoQuality: string
      fps: string
      maxTimeCutSeconds: number
      removeCutVideoTime: number
      removeVideoTime: number
    }
    url: string
  }
}
