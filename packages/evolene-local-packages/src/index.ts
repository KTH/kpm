import { promises as fs } from "node:fs";
import path from "node:path";
import {
  pathExists,
  getWorkspaceGlobs,
  getPackageDirectoriesFromGlobs,
  createLockFile,
  loadPackageJson,
  renameFileIfExist
// @ts-ignore
} from "./utils.ts";

/*************************
 * Main Entry Point Here *
 *************************/

/*
  Usage:
  npx ts-node --esm packages/evolene-local-packages/index.ts

  TODO: Should move shell script code to this package
  TODO: Break main code into more functions
  TODO: Check how we provide this as a npm bin/ executable
  TODO: Move helper functions to utils.ts
*/

const cwd = process.cwd();
console.log(`Creating package-lock.json files for workspaces in ${cwd}`);

const workspaceGlobs = await getWorkspaceGlobs(path.join(cwd, "package.json"));
console.log("Workspace configuration:");
console.log(workspaceGlobs.map((o: string) => `- ${o}`).join("\n"));

const packageDirectories = await getPackageDirectoriesFromGlobs(workspaceGlobs);
console.log("Workspace directories found:");
console.log(packageDirectories.map((o: string) => `- ${o}`).join("\n"));

// Create package lookup dict
const packageLookup: { [index: string]: { path: string, name: string } } = {}
for (const pkgPath of packageDirectories) {
  const pathToPackageJson = path.join(pkgPath, "package.json");
  const packageJsonFile = await fs.readFile(pathToPackageJson);
  const json = JSON.parse(await new TextDecoder().decode(packageJsonFile));
  packageLookup[json.name] = { path: pkgPath, name: json.name };
}

// For each package, check if it depends on a local workspace package
for (const pkgPath of packageDirectories) {
  const json = await loadPackageJson(pkgPath);

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
      matchingPackages.push(pkg);
    }
  }

  // If we have matchingPackages then we depend on local packages so...
  if (matchingPackages.length > 0) {
    console.log(`Workspace ${json.name} has local packages, preparing evolene_local_packages/`);
  }

  // 1. add workspaces to package.json
  if (matchingPackages.length > 0) {
    // Create backup of package.json
    const pathToPackageJson = path.join(pkgPath, "package.json");
    // console.log(`Backup file: ${pathToPackageJson}`)
    await fs.cp(pathToPackageJson, `${pathToPackageJson}.bak`);
    json["workspaces"] = matchingPackages.map(t => `evolene_local_packages/${t.name}`);
    const jsonAsString = await new TextEncoder().encode(JSON.stringify(json));
    // console.log(pathToPackageJson, JSON.stringify(json));
    await fs.writeFile(pathToPackageJson, jsonAsString);
  }

  // 2. copy folders to workspace
  if (matchingPackages.length > 0) {
    const evoleneDirPath = path.join(pkgPath, "evolene_local_packages");

    // console.log(`Evolene local package directory: ${evoleneDirPath}`)
    if (!await pathExists(evoleneDirPath)) {
      await fs.mkdir(evoleneDirPath);
    }
    for (const { path: srcPath, name: srcName } of matchingPackages) {
      console.log(`- Copy ${srcName} from folder ${path.join(cwd, srcPath)}`);
      await fs.cp(
        path.join(cwd, srcPath),
        path.join(pkgPath, "evolene_local_packages", srcName),
        { recursive: true });
    }
  }

  // 3. Add/remove evolene-local-packages.json
  const pathToEvoleneLocalPackagesJson = path.join(pkgPath, "evolene-local-packages.json");
  if (matchingPackages.length > 0) {
    const json: { [index: string]: { path: string } } = {};

    for (const { name, path } of matchingPackages) {
      json[name] = { path };
    }

    const jsonAsString = await new TextEncoder().encode(JSON.stringify(json));
    await fs.writeFile(pathToEvoleneLocalPackagesJson, jsonAsString);
  } else {
    // Remove evolene-local-packages.json
    if (await pathExists(pathToEvoleneLocalPackagesJson)) {
      await fs.rm(pathToEvoleneLocalPackagesJson);
    }
  }
}

// Hide package.json from NPM (revealed at end)
await fs.rename(path.join(cwd, "package.json"), path.join(cwd, "package.json.tmp"))

try {
  // Generate package-lock.json files and clean up
  for (const pkgPath of packageDirectories) {
    const json = await loadPackageJson(pkgPath);
    console.log(`Creating package-lock.json for ${json.name}`);
    const { error, stdout, stderr } = await createLockFile(pkgPath);
    if (error) {
      console.error(stderr, error);
    } else {
      // This is a bit verbose, so hiding for now
      // console.info(stdout);
    }
    // Clean up evolene_local_packages/ and restore package.json.bak
    await fs.rm(path.join(pkgPath, "evolene_local_packages"), { recursive: true, force: true });
    await renameFileIfExist(path.join(pkgPath, "package.json.bak"), path.join(pkgPath, "package.json"));
  }
} catch (err) {
  //
  console.error(err);
}

// Reveal package.json to NPM
await renameFileIfExist(path.join(cwd, "package.json.tmp"), path.join(cwd, "package.json"));