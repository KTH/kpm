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
server.listen(process.env.PORT || 3000, () => {
  log.info(`Starting KPM at ${process.env.SERVER_HOST_URL}/kpm`);
});
