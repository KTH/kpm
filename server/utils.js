const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");

function compileTemplate(resolvePath, name) {
  return handlebars.compile(
    fs.readFileSync(path.resolve(resolvePath, name), {
      encoding: "utf-8",
    })
  );
}

module.exports = { compileTemplate };
