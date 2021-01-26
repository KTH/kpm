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
const log = require("skog");
const { renewCortinaBlock, fetchCortinaBlock } = require("./server/utils");

server.listen(process.env.PORT || 3000, async () => {
  log.info(
    `Starting KPM at ${process.env.SERVER_HOST_URL}/kpm. Fetching Cortina blocks`
  );
  await fetchCortinaBlock("footer");
  await fetchCortinaBlock("megaMenu");
  await fetchCortinaBlock("search");
});

setInterval(async function renewAllCortinaBlocks() {
  await renewCortinaBlock("footer");
  await renewCortinaBlock("megaMenu");
  await renewCortinaBlock("search");
}, 62 * 62 * 1000);
