# KPM

Monorepos for KPM implemented in Typescript for Nodejs.

## Development
1. Clone the repos and enter 

2. Run `npm i` from the root of the project

3. Run `npm run dev` from the root of the project

This starts all the applications in development mode including a frontend development server with hot module replacement (code in app updates automatically).

Normally you reach the frontend at http://localhost:1234.

### Developing the loader script
- Run `npm run dev-prod`

This builds the frontend bundle and starts all other apps in development mode. You can now reach the frontend at http://localhost:3000/kpm/index.html. This is an empty HTML-page that injects the menu using loader.

### Understanding the postinstall script
After you run `npm i` the project will run a postinstall script. This script is needed to prepare the project for the CD/CI-pipelin Evolene. This is what happens:

1. any local development dependencies are temporarily moved to a folder in each workspace:
    
     ./evolene-local-packages/

2. each workspace adds ./evolene-local-packages/ as a workspace

3. the root package.json is temporarily hidden (renamed)

4. each workspace updates their package-lock.json by running `npm i`

5. the temporary folder ./evolene-local-packages/ is removed in each workspace

6. the root package.json is exposed again (renamed back)

If the postinstall script fails you get A LOT of new files in git. If you don't want to perform a reset of your repos to last commit you can clean up using the following commands:

```sh
echo "Remove temporary local packages folder"
npm exec --workspaces -c "rm -rf ./evolene-local-packages"
echo "Reveal project root package.json"
mv package.json.tmp package.json
echo "Revert to proper package.json for each workspace"
npm exec --workspaces -c "mv package.json.bak package.json"
```

## CD/CI
The Evolene CD/CI-pipeline is triggered on pushes to Github. The file `evolene-ci.yml` specifies what applications we want Evolene to work by setting the env-var `MONOREPO_SUBPATH` for each app.

Evolene will check for the presence of the following file:

- `evolene-local-packages.json`

and copy the specified local packages to the sub folder `./evolene-local-packages/` prior to running `npm ci`. This allows `package-lock.json` to be properly resolved. 

The reason for this is that `Dockerfile` can only copy content from the same directory or subdirectories.