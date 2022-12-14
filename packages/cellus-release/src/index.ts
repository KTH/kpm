import { execSync } from "child_process";
import { loadPackageJson, loadDockerConf, writeDockerConf } from "./utils";

/*************************
 * Main Entry Point Here *
 *************************/

const cwd = process.cwd();

const cmdBuffer = execSync("git branch --show-current");
const cmdOutput = await new TextDecoder().decode(cmdBuffer);
if (cmdOutput !== "main") {
  throw new Error(
    `You can only release when you are on main. Current branch is: ${cmdOutput}`
  );
}

process.exit(1);

console.log(`Creating package-lock.json files for workspaces in ${cwd}`);
const dockerConf = await loadDockerConf(cwd);
const packageJson = await loadPackageJson(cwd);
const currentVersion = dockerConf["IMAGE_VERSION"];

if (!/^[0-9\.]*$/.test(currentVersion)) {
  throw new Error(
    `The version string contains illegal characters: ${currentVersion}`
  );
}
console.log(
  `${packageJson.name} --- VERSION: "~${currentVersion}.0" # Deploy any minor version match`
);

// Tag a release
const tag = `v${currentVersion}`;
execSync(`git commit --allow-empty -m "Realease ${tag}"`);
execSync(`git tag ${tag}`);
execSync(`git push --atomic origin main ${tag}`);

// Update docker.conf to avoid deploying further changes to active
const tmpVersion = currentVersion.split(".").map((v) => parseInt(v));
tmpVersion[1]++;
const newVersion = tmpVersion.join(".");
const newDockerConf = { ...dockerConf };
newDockerConf["IMAGE_VERSION"] = newVersion;
await writeDockerConf(cwd, newDockerConf);
execSync(
  "git add docker.conf && git commit -m 'Bump docker.conf for deployment to STAGE only' && git push origin main"
);
