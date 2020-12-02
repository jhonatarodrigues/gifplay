import app from './app'
import './config'
import moment from 'moment-timezone'

const port = process.env.PORT || 8080

// -- config moment locale
moment.tz.setDefault('America/Sao_Paulo')
moment.locale('pt-br')

console.log(`server on port ${port}`)

app.listen(port)
