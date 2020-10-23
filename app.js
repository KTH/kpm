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

const blocks = {
  title: '1.260060',
  megaMenu: '1.855134',
  secondaryMenu: '1.865038',
  image: '1.77257',
  footer: '1.202278',
  search: '1.77262',
  language: {
    en: '1.77273',
    sv: '1.272446',
  },
  analytics: '1.464751',
  gtmAnalytics: '1.714097',
  gtmNoscript: '1.714099',
}

const template = handlebars.compile(fs.readFileSync(path.resolve(__dirname, './src/index.handlebars'), {
  encoding: 'utf-8'
}))

async function fetchBlock(str) {
  const res = await got.get(`https://www.kth.se/cm/${blocks[str]}`)
  return res.body
}

app.use('/kpm/dist', express.static('dist'))

app.get('/kpm/_monitor', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send('APPLICATION_STATUS: OK')
})

app.get('/kpm', async (req, res) => {
  const footer = await fetchBlock('footer')
  const megaMenu = await fetchBlock('megaMenu')
  const search = await fetchBlock('search')
  res.send(template({
    footer,
    megaMenu,
    search,
  }));
});

app.listen(3000, () => {
  log.info('Starting app KPM in port 3000')
})
