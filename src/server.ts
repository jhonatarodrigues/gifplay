import app from './app'
import './config'
import moment from 'moment-timezone'

// -- config moment locale
moment.tz.setDefault('America/Sao_Paulo')
moment.locale('pt-br')

app.listen(8080)
