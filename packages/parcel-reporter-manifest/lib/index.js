const fs = require("fs");
const path = require("path");
const { Reporter } = require("@parcel/plugin");

module.exports = new Reporter({
  report({ event }) {
    if (event.type === "buildSuccess") {
      // Get the dist directory from the first bundle
      let distDir = null;
      // Create a manifest object that is used by loader
      const manifest = {};
      for (const file of event.bundleGraph.getBundles()) {
        distDir = distDir ? distDir : file.target.distDir;
        const fileName = file.displayName.split(".").shift();
        const fileExt = file.displayName.split(".").pop();
        manifest[`${fileName}.${fileExt}`] = {
          fileName: file.filePath.split("/").pop(),
        };
      }

      fs.writeFileSync(
        path.join(distDir, "manifest.json"),
        JSON.stringify(manifest, null, 2)
      );
    }
  },
});
