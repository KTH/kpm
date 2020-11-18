//
require("dotenv").config();
require("skog/bunyan").createLogger({
  app: "kpm",
  name: "kpm",
  level: "info",
  serializers: require("bunyan").stdSerializers,
});

const server = require("./src/server");
const log = require("skog");
server.listen(process.env.PORT || 3000, () => {
  log.info("Started HTTP server");
});
