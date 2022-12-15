import { execSync } from "child_process";
import path from "path";
import {
  loadPackageJson,
  loadDockerConf,
  writeDockerConf,
  // @ts-ignore
} from "./utils.ts";

/*************************
 * Main Entry Point Here *
 *************************/

try {
  const [a, b, ...args] = process.argv;
  console.log(`Preparing release of: ${args.join(", ")}`);

  const cmdBuffer = execSync("git branch --show-current");
  const cmdOutput = await new TextDecoder().decode(cmdBuffer);
  if (cmdOutput.trim() !== "main") {
    throw new Error(
      `You can only release when you are on main. Current branch is: ${cmdOutput}`
    );
  }

  // TODO: We should really use the version from root package.json so everything is in sync
  // But using last processed docker.conf for now
  let currentVersion;
  for (const appDir of args) {
    const cwd = path.join(process.cwd(), appDir);

    const dockerConf = await loadDockerConf(cwd);
    const packageJson = await loadPackageJson(cwd);
    const appVersion = dockerConf["IMAGE_VERSION"];

    if (!/^[0-9\.]*$/.test(appVersion)) {
      throw new Error(
        `The version string contains illegal characters: ${appVersion}`
      );
    }
    console.log(
      `\n${packageJson.name} --- VERSION: "~${appVersion}.0" # Deploy any minor version match\n`
    );
    currentVersion = appVersion;
  }

  // Tag a release
  const tag = `v${currentVersion}`;
  execSync(`git commit --allow-empty -m "Realease ${tag}"`);
  execSync(`git tag ${tag}`);
  execSync(`git push --atomic origin main ${tag}`);

  for (const appDir of args) {
    const cwd = path.join(process.cwd(), appDir);

    const dockerConf = await loadDockerConf(cwd);
    const packageJson = await loadPackageJson(cwd);
    const appVersion = dockerConf["IMAGE_VERSION"];
    // Update docker.conf to avoid deploying further changes to active
    const tmpVersion = appVersion.split(".").map((v: string) => parseInt(v));
    tmpVersion[1]++;
    const newVersion = tmpVersion.join(".");
    const newDockerConf = { ...dockerConf };
    newDockerConf["IMAGE_VERSION"] = newVersion;
    await writeDockerConf(cwd, newDockerConf);
  }

  execSync(
    "git add . && git commit -m 'Bump docker.conf for deployment to STAGE only' && git push origin main"
  );
} catch (err: any) {
  console.log(err.message);
  process.exit(1);
}