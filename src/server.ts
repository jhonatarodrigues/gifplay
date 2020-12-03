import app from './app'
import './config'
import moment from 'moment-timezone'
import http from 'http'
import https from 'https'

const portHttp = 8080
const portHttps = 8085

// -- config moment locale
moment.tz.setDefault('America/Sao_Paulo')
moment.locale('pt-br')

console.log(`server on port ${portHttp} and https: ${portHttps}`)

const httpServer = http.createServer(app)
const httpsServer = https.createServer(app)

httpServer.listen(portHttp)
httpsServer.listen(portHttps)
