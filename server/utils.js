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
    .get(`https://www.kth.se/cm/${blockIds[str]}`)
    .then((res) => res.body);

  // We store the Promise after getting the value, not the value
  cachedBlocks[str] = await body;
}

/** Returns the cached-version of the block or fetches it */
function fetchCortinaBlock(str) {
  return cachedBlocks[str] || `<!-- Missing Cortina block ${str} -->`;
}

module.exports = { compileTemplate, fetchCortinaBlock, renewCortinaBlock };
