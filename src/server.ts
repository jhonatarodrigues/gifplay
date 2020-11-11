import app from './app'
import './config'
import cron from 'node-cron'

cron.schedule('* * * * *', () => console.log('Executando a tarefa a cada 1 minuto'))

app.listen(8080)
