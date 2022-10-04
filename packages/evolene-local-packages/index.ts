import { promises as fs } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import glob from "glob";

async function getWorkspaceGlobs(pathToPackageJson: string): Promise<string[]> {
  assert(pathToPackageJson.split(path.sep).pop() === "package.json",
    `The provided path ${pathToPackageJson} doesn't point to a package.json file.`);

  assert(await fs.stat(pathToPackageJson),
    `No file could be found at ${pathToPackageJson}`);

  const packageJsonFile = await fs.readFile(pathToPackageJson);
  const json = JSON.parse(await new TextDecoder().decode(packageJsonFile));

  assert(Array.isArray(json.workspaces),
    `The package.json file found at ${pathToPackageJson} did not contain an array "workspaces"`);

  const workspaceGlobs = json.workspaces;
  return workspaceGlobs;
}

async function getPackageDirectoriesFromGlobs(workspaceGlobs: string[]): Promise<string[]> {
  let workspacesOut: string[] = [];
  // Get all possible matches
  for (const wsGlob of workspaceGlobs) {
    if (!wsGlob) continue;

    const entries = await new Promise<string[]>((resolve, reject) => {
      try {
        glob(wsGlob, (err, matches) => err ? reject(err) : resolve(matches));
      } catch (err) {
        reject(err);
      }
    });
    workspacesOut = [
      ...workspacesOut,
      ...entries
    ];
  }

  // Filter out directories containing a package.json
  const tmpOut = await Promise.all(workspacesOut.map(async (wsPath) => {
    const tmp = await fs.stat(wsPath);
    if (tmp.isDirectory() && await fs.stat(path.join(wsPath, "package.json"))) {
      return wsPath;
    };
  }));
  workspacesOut = tmpOut.filter(t => t) as string[];
  return workspacesOut
}

const cwd = process.cwd();
console.log(cwd);

const workspaceGlobs = await getWorkspaceGlobs(path.join(cwd, "package.json"));
console.log(workspaceGlobs);

const packageDirectories = await getPackageDirectoriesFromGlobs(workspaceGlobs);
console.log(packageDirectories);

// Create package lookup dict
const packageLookup: { [index: string]: { path: string }} = {}
for (const pkgPath of packageDirectories) {
  const pathToPackageJson = path.join(pkgPath, "package.json");
  const packageJsonFile = await fs.readFile(pathToPackageJson);
  const json = JSON.parse(await new TextDecoder().decode(packageJsonFile));
  packageLookup[json.name] = { path: pkgPath };
}

// For each package, check if it depends on a local workspace package
for (const pkgPath of packageDirectories) {
  const pathToPackageJson = path.join(pkgPath, "package.json");
  const packageJsonFile = await fs.readFile(pathToPackageJson);
  const json = JSON.parse(await new TextDecoder().decode(packageJsonFile));

  const matchingPackages: { path: string, name: string }[] = [];
  let allDeps: string[] = [];
  if (typeof json.dependencies === "object") {
    allDeps = Object.keys(json.dependencies);
  }
  if (typeof json.devDependencies === "object") {
    allDeps = [...allDeps, ...Object.keys(json.devDependencies)];
  }
  for (const pkgName of allDeps) {
    const pkg = packageLookup[pkgName];
    if (pkg) {
      matchingPackages.push({ name: pkgName, ...pkg });
    }
  }

  // add workspaces to package.json
  if (matchingPackages.length > 0) {
    // Create backup of package.json
    console.log(`Backup file: ${pathToPackageJson}`)
    await fs.cp(pathToPackageJson, `${pathToPackageJson}.bak`);
    json["workspaces"] = matchingPackages.map(t => `evolene_local_packages/${t.name}`);
    const tmp = await new TextEncoder().encode(JSON.stringify(json));
    // console.log(pathToPackageJson, JSON.stringify(json));
    await fs.writeFile(pathToPackageJson, tmp);
  }

  // copy folders to workspace
  if (matchingPackages.length > 0) {
    const evoleneDirPath = path.join(pkgPath, "evolene_local_packages");
    if (!await fs.stat(evoleneDirPath)) {
      console.log(`Create directory: ${evoleneDirPath}`)
      await fs.mkdir(evoleneDirPath);
    }
    for (const { path: srcPath } of matchingPackages) {
      const srcName = srcPath.split(path.sep).pop() as string;
      console.log(`Copy folder ${path.join(cwd, srcPath)} to ${path.join(pkgPath, "evolene_local_packages", srcName)}`);
      await fs.cp(path.join(cwd, srcPath), path.join(pkgPath, "evolene_local_packages", srcName));
    }
  }
}


/*
  npx ts-node --esm packages/evolene-local-packages/index.ts
*/