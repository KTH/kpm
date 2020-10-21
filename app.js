const handlebars = require('handlebars')
const got = require('got')
const path = require('path')
const fs = require('fs')
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

const template = handlebars.compile(fs.readFileSync(path.resolve(__dirname, './src/index.html'), {
  encoding: 'utf-8'
}))

async function fetchFooter() {
  const res = await got.get('https://www.kth.se/cm/1.202278')
  return res.body
}

app.use('/kpm/dist', express.static('dist'))

app.get('/kpm/_monitor', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send('APPLICATION_STATUS: OK')
})

app.get('/kpm', async (req, res) => {
  const footer = await fetchFooter()
  res.send(template({
    footer,
  }));
});

app.listen(3000, () => {
  log.info('Starting app KPM in port 3000')
})
