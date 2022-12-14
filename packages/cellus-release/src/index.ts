import { execSync } from "child_process";
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
  const cwd = process.cwd();

  const cmdBuffer = execSync("git branch --show-current");
  const cmdOutput = await new TextDecoder().decode(cmdBuffer);
  //if (cmdOutput !== "main") {
  if (cmdOutput.trim() !== "create-release-script") {
    throw new Error(
      `You can only release when you are on main. Current branch is: ${cmdOutput}`
    );
  }

  const dockerConf = await loadDockerConf(cwd);
  const packageJson = await loadPackageJson(cwd);
  const currentVersion = dockerConf["IMAGE_VERSION"];

  if (!/^[0-9\.]*$/.test(currentVersion)) {
    throw new Error(
      `The version string contains illegal characters: ${currentVersion}`
    );
  }
  console.log(
    `\n${packageJson.name} --- VERSION: "~${currentVersion}.0" # Deploy any minor version match\n`
  );

  // Tag a release
  const tag = `v${currentVersion}`;
  execSync(`git commit --allow-empty -m "Realease ${tag}"`);
  execSync(`git tag ${tag}`);
  execSync(`git push --atomic origin main ${tag}`);

  // Update docker.conf to avoid deploying further changes to active
  const tmpVersion = currentVersion.split(".").map((v: string) => parseInt(v));
  tmpVersion[1]++;
  const newVersion = tmpVersion.join(".");
  const newDockerConf = { ...dockerConf };
  newDockerConf["IMAGE_VERSION"] = newVersion;
  await writeDockerConf(cwd, newDockerConf);
  execSync(
    "git add docker.conf && git commit -m 'Bump docker.conf for deployment to STAGE only' && git push origin main"
  );
} catch (err: any) {
  console.log(err.message);
  process.exit(1);
}
