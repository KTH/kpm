import { promises as fs } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import glob from "glob";
import { exec, spawn } from "node:child_process";

export async function pathExists(pathTo: string): Promise<boolean> {
  let exists = false;
  try {
    exists = !!await fs.stat(pathTo);
  } catch (err) {
    //
  }
  return exists;
}

export async function getWorkspaceGlobs(pathToPackageJson: string): Promise<string[]> {
  assert(pathToPackageJson.split(path.sep).pop() === "package.json",
    `The provided path ${pathToPackageJson} doesn't point to a package.json file.`);

  // This will blow up if file doesn't exist 
  assert(await pathExists(pathToPackageJson),
    `No file could be found at ${pathToPackageJson}`);

  const packageJsonFile = await fs.readFile(pathToPackageJson);
  const json = JSON.parse(await new TextDecoder().decode(packageJsonFile));

  assert(Array.isArray(json.workspaces),
    `The package.json file found at ${pathToPackageJson} did not contain an array "workspaces"`);

  const workspaceGlobs = json.workspaces;
  return workspaceGlobs;
}

export async function getPackageDirectoriesFromGlobs(workspaceGlobs: string[]): Promise<string[]> {
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

type TCreateLockFile = {
  error?: Error,
  stdout: string,
  stderr: string,
}
export async function createLockFile(pkgPath: string) : Promise<TCreateLockFile> {
  return new Promise((resolve, reject) => {
    exec("npm i --package-lock-only", { cwd: pkgPath }, (error, stdout, stderr) => {
      if (error) {
        return reject({
          error,
          stdout,
          stderr
        })
      }
      resolve({ stdout, stderr });
    })
  });
}

export async function createLockFileSpawn(pkgPath: string) {
  return new Promise((resolve, reject) => {
    const ls = spawn("npm", ["i", "--package-lock-only"]);
    const outp: { type: string, msg: string }[] = [];
    
    ls.stdout.on('data', (data) => {
      outp.push({ type: "stdout", msg: data });
    });
    
    ls.stderr.on('data', (data) => {
      outp.push({ type: "stderr", msg: data });
    });
    
    ls.on('close', (code) => {
      if (code !== 0) {
        return reject({
          exitCode: code,
          outp 
        });
      }

      return resolve({
        exitCode: code,
        outp
      })
    });
  });
}

export async function loadPackageJson(pkgPath: string) : Promise<any> {
  const pathToPackageJson = path.join(pkgPath, "package.json");
  const packageJsonFile = await fs.readFile(pathToPackageJson);
  const json = JSON.parse(await new TextDecoder().decode(packageJsonFile));
  return json;
}

export async function renameFileIfExist(srcPath: string, destPath: string) : Promise<void> {
  try {
    await fs.stat(srcPath);
    await fs.rename(srcPath, destPath);
  } catch (e) {
    // Do nothing
  };
}