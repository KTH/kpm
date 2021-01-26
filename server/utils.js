const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const log = require("skog");
const got = require("got");

function compileTemplate(resolvePath, name) {
  return handlebars.compile(
    fs.readFileSync(path.resolve(resolvePath, name), {
      encoding: "utf-8",
    })
  );
}

// In-memory cached Cortina blocks. It stores Promises of blocks, not the
// actual content
const cachedBlocks = {};
const blockIds = {
  title: "1.260060",
  megaMenu: "1.855134",
  secondaryMenu: "1.865038",
  image: "1.77257",
  footer: "1.202278",
  search: "1.77262",
  language: {
    en: "1.77273",
    sv: "1.272446",
  },
  analytics: "1.464751",
  gtmAnalytics: "1.714097",
  gtmNoscript: "1.714099",
};

/** Renew a cached-block */
async function renewCortinaBlock(str) {
  log.info(`Renewing Cortina block ${str}`);

  const body = got
    .get(`https://www.kth.se/cm/${blocks[str]}`)
    .then((res) => res.body);

  await body;

  // We store the Promise after getting the value, not the value
  cachedBlocks[str] = body;
}

/** Returns the cached-version of the block or fetches it */
async function fetchCortinaBlock(str) {
  if (cachedBlocks[str]) {
    log.debug(`Cache hit for Cortina block ${str}`);
    return cachedBlocks[str];
  }

  // We don't await here. Instead we return the promise
  const body = got
    .get(`https://www.kth.se/cm/${blockIds[str]}`)
    .then((res) => res.body);

  cachedBlocks[str] = body;
  return body;
}

module.exports = { compileTemplate, fetchCortinaBlock, renewCortinaBlock };
