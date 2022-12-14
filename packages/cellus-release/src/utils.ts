import fs, { promises as fsAsync } from "node:fs";
import path from "node:path";
import readline from "readline";

export async function pathExists(pathTo: string): Promise<boolean> {
  let exists = false;
  try {
    exists = !!(await fsAsync.stat(pathTo));
  } catch (err) {
    //
  }
  return exists;
}

export async function loadPackageJson(pkgPath: string): Promise<any> {
  const pathToPackageJson = path.join(pkgPath, "package.json");
  const packageJsonFile = await fsAsync.readFile(pathToPackageJson);
  const json = JSON.parse(await new TextDecoder().decode(packageJsonFile));
  return json;
}

export async function loadDockerConf(
  pkgPath: string
): Promise<Record<string, string>> {
  const pathToDockerConf = path.join(pkgPath, "docker.conf");
  // const dockerConfFile = await fsAsync.readFile(pathToDockerConf);
  // const body = await new TextDecoder().decode(dockerConfFile);

  const fileStream = fs.createReadStream(pathToDockerConf);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  const outp: Record<string, string> = {};

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    const [key, val]: string[] = line.split("=");
    outp[key] = val.trim();
  }

  return outp;
}

export async function renameFileIfExist(
  srcPath: string,
  destPath: string
): Promise<void> {
  try {
    await fsAsync.stat(srcPath);
    await fsAsync.rename(srcPath, destPath);
  } catch (e) {
    // Do nothing
  }
}
