//
require("dotenv").config();
require("skog/bunyan").createLogger({
  app: "kpm",
  name: "kpm",
  level: "info",
  serializers: require("bunyan").stdSerializers,
});

require("@kth/reqvars").check();
const server = require("./server/server");
const openid = require("./server/openid");
const log = require("skog");
const { renewCortinaBlock, fetchCortinaBlock } = require("./server/utils");

server.listen(process.env.PORT || 3000, async () => {
  await openid.init();
  log.info(
    `Starting KPM at ${process.env.SERVER_HOST_URL}/kpm. Fetching Cortina blocks`
  );
  await Promise.all([
    renewCortinaBlock("footer"),
    renewCortinaBlock("megaMenu"),
    renewCortinaBlock("search"),
  ]);
  log.info("Cortina blocks ready");
});

setInterval(async function renewAllCortinaBlocks() {
  await renewCortinaBlock("footer");
  await renewCortinaBlock("megaMenu");
  await renewCortinaBlock("search");
}, 62 * 62 * 1000);
