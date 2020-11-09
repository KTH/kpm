const handlebars = require('handlebars')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto');
const got = require('got')
const https = require('https')
const http = require('http')
const { readFileSync } = require('fs')

const { addDays } = require('date-fns');

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

function compileTemplate(name) {
    return handlebars.compile(fs.readFileSync(path.resolve(__dirname, 'src', name), {
        encoding: 'utf-8'
    }))
}

const template = compileTemplate('index.handlebars')
const kpmJsTemplate = compileTemplate('kpm.js.handlebars')

// TODO: Sass?
const menuCssData = fs.readFileSync(path.resolve(__dirname, 'src', 'menu.css'))
const menuCssName = `menu-${hash(menuCssData)}.css`

function hash(data) {
  const hash = crypto.createHash('sha256')
  hash.update(data)
  return hash.digest('base64').slice(0, 12)
}

async function fetchBlock(str) {
  const res = await got.get(`https://www.kth.se/cm/${blocks[str]}`)
  return res.body
}

app.use('/kpm/dist', express.static('dist'))

app.get('/kpm/_monitor', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  let version = 'unknown'
  try {
    const info = require('./buildinfo.js')
    version = `${info.dockerName}-${info.dockerVersion} (${info.gitBranch})`
  } catch(err) {
    log.warn(`Failed to get app version: ${err}`)
  }
  res.send(`APPLICATION_STATUS: OK ${version}`)
})

app.get(`/kpm/${menuCssName}`, (req, res) => {
  res.setHeader('Content-Type', 'text/css')
  res.setHeader('Expires', addDays(new Date(), 180).toUTCString())
  res.send(menuCssData)
})

app.get('/kpm/kpm.js', (req, res) => {
  const kpm_base = `${process.env.SERVER_HOST_URL}/kpm/`;
  const css_url = `${kpm_base}${menuCssName}`
  res.setHeader('Content-Type', 'application/javascript');
  res.send(kpmJsTemplate({
    css_url,
    kpm_base,
  }));
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

http.createServer(app).listen(80)
https.createServer({
  key: readFileSync('./certs/key.pem'),
  cert: readFileSync('./certs/cert.pem'),
  passphrase: 'lolo'
}, app).listen(443)
