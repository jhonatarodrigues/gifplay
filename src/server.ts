import app from './app'
import './config'
import moment from 'moment-timezone'
import http from 'http'
import https from 'https'
import fs from 'fs'

const portHttp = 8080
const portHttps = 8085

// -- criacao de pastas necessárias
if (!fs.existsSync(global.camera.outputFolder)) {
  fs.mkdirSync(global.camera.outputFolder)
}
if (!fs.existsSync(global.camera.thumbs)) {
  fs.mkdirSync(global.camera.thumbs)
}
if (!fs.existsSync(global.camera.cut)) {
  fs.mkdirSync(global.camera.cut)
}
if (!fs.existsSync(global.camera.preview)) {
  fs.mkdirSync(global.camera.preview)
}
if (!fs.existsSync(global.camera.uploadFolder)) {
  fs.mkdirSync(global.camera.uploadFolder)
}
if (!fs.existsSync(global.camera.uploadFolderTratado)) {
  fs.mkdirSync(global.camera.uploadFolderTratado)
}
if (!fs.existsSync(global.camera.uploadFolderPreview)) {
  fs.mkdirSync(global.camera.uploadFolderPreview)
}
if (!fs.existsSync(global.camera.uploadFolderCut)) {
  fs.mkdirSync(global.camera.uploadFolderCut)
}

// -- config moment locale
moment.tz.setDefault('America/Sao_Paulo')
moment.locale('pt-br')

console.log(`server on port ${portHttp} and https: ${portHttps}`)

const httpServer = http.createServer(app)
const httpsServer = https.createServer(app)

httpServer.listen(portHttp)
httpsServer.listen(portHttps)
