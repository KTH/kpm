const express = require('express')
const got = require('got')
const cheerio = require('cheerio')
const app = express()
let attempts = 0
app.get('/login', async (req, res) => {
  const serviceUrl = 'http://localhost:3000/login'
  const loginUrl = new URL('https://login-r.referens.sys.kth.se/login')
  const serviceValidateUrl = new URL('https://login-r.referens.sys.kth.se/serviceValidate')
  // Get atempts from session (cookie)
  attempts++
  // If this comes with a parameter "ticket", it means that this request comes
  // from the KTH login server.
  //
  // Otherwise, we need to redirect the user to the login URL
  if (!req.query.ticket && attempts > 2) {
    res.send('You are not logged in')
    return
  } else if (!req.query.ticket) {
    loginUrl.searchParams.set('service', serviceUrl)
    loginUrl.searchParams.set('gateway', true)
    console.log(`Redirecting user to ${loginUrl}`)
    res.redirect(loginUrl)
    return
  }
  serviceValidateUrl.searchParams.set('ticket', req.query.ticket)
  serviceValidateUrl.searchParams.set('service', serviceUrl)
  const {body} = await got(serviceValidateUrl)
  console.log(body)
  const $ = cheerio.load(body, { xml: { normalizeWhitespace: true } })
  const successNode = $('cas\\:serviceResponse').children('cas\\:authenticationSuccess')
  if (successNode.length === 0) {
    const failureNode = $('cas\\:serviceResponse cas\\:authenticationFailure')
    console.log(`Authentication failure. Code: ${failureNode.attr('code')}: ${failureNode.text()}`)
    res.send('Authentication error')
    return
  }
  const user = successNode.children('cas\\:user').text()
  console.log(`Auth successful. KTH ID: ${user}`)
  res.send(`Welcome ${user}`)
  res.send('Welcome')
  attempts = 0
})
app.get('/', (req, res) => {
  res.send('Hello. This page will show if you are authenticated or not')
})
app.listen(3000, () => {
  console.log('Listening in port 3000')
})