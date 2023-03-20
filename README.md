# KPM

Monorepos for KPM implemented in Typescript for Nodejs.

## Release

KPM consists of multiple applications that should be released in sync. Follow this procedure:

1. Check out **main** and stash any uncommited changes
2. Run `npm run release`
   - the release script in cellus-release will be executed
   - your release will be tagged with current version in docker.conf
   - docker.conf files will be updated with a new minor version
3. Update ACTIVE for each app in cellus-registry with the release version string that has been output to console
   - kpm/ACTIVE/docker-stack.yml
   - my-canvas-rooms-api/ACTIVE/docker-stack.yml
   - my-studies-api/ACTIVE/docker-stack.yml
   - my-teaching-api/ACTIVE/docker-stack.yml

Any further commits on main will now only be deployed in STAGE because docker.conf was updated for each app.

The deployed image will be marked with the release tag.

## Development

1. Clone the repo and enter

2. Run `npm i` from the root of the project

3. Create .env files for the APIs and backend:

```sh
(cd apis/my-canvas-rooms-api; cp .env.in .env)
(cd apis/my-teaching-api; cp .env.in .env)
(cd apis/my-studies-api; cp .env.in .env)
(cd kpm/kpm-backend; cp .env.in .env)
```

4. Run `npm run dev` from the root of the project

This starts all the applications in development mode including a frontend development server with hot module replacement (code in app updates automatically).

Normally you reach the frontend at http://localhost:1234

You can find our [development guidelines here](README_development.md).

### IKEv2 VPN is required to reach external APIs

You need to activate IKEv2 VPN to access certain APIs.

### Setting a fake user

Set the env-var `USE_FAKE_USER` in kpm-backend/.env to view data from that user in stage during local development. This can also be done in STAGE.

NOTE: Newer users don't get the correct KTH ID in Canvas TEST due to the way the test-env is created. The solution is to change the KTH ID in Canvas TEST by editing that user.

### Developing the loader script

- Run `npm run dev-loader`

This builds the frontend bundle and starts all other apps in development mode. You can now reach the frontend at http://localhost:3000/kpm/index.html. This is an empty HTML-page that injects the menu using loader.

### Understanding the postinstall script

After you run `npm i` the project will run a postinstall script. This script is needed to prepare the project for the CI/CD-pipelin Evolene. This is what happens:

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

## CI/CD

The Evolene CI/CD-pipeline is triggered on pushes to Github. The file `evolene-ci.yml` specifies what applications we want Evolene to work by setting the env-var `MONOREPO_SUBPATH` for each app.

Evolene will check for the presence of the following file:

- `evolene-local-packages.json`

and copy the specified local packages to the sub folder `./evolene-local-packages/` prior to running `npm ci`. This allows `package-lock.json` to be properly resolved.

The reason for this is that `Dockerfile` can only copy content from the same directory or subdirectories.
