const path = require('path')
require('dotenv').config()
require('skog/bunyan').createLogger({
  app: 'kpm',
  name: 'kpm',
  level: 'info',
  serializers: require('bunyan').stdSerializers
})
const log = require('skog')
const express = require('express')
const app = express()

app.use('/kpm/dist', express.static('dist'))

app.get('/kpm/_monitor', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send('APPLICATION_STATUS: OK')
})

app.get('/kpm', (req, res) => {
  res.sendFile(path.resolve(__dirname, './src/index.html'))
});

app.listen(3000, () => {
  log.info('Starting app KPM in port 3000')
})
