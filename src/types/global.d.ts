// -- cams
declare namespace NodeJS {
  interface Global {
    camera: {
      outputFolder: string
      uploadFolder: string
      thumbs: string
      cut: string
      preview: string
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
