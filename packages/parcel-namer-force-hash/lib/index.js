const { Namer } = require("@parcel/plugin");

module.exports = new Namer({
  name({ bundle }) {
    let name = "index";
    // if (!bundle.needsStableName) {
    //   name += "." + bundle.hashReference;
    // }
    name += "." + bundle.hashReference + "." + bundle.type;
    return name;
  },
});
