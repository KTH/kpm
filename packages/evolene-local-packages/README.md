# Evolene Monorepos Support
On the postinstall hook of your root package.json file we need to call
the evolene-local-packages package. This will update each package-lock.json
file in the workspaces so they point to a virtual copy of any local
development packages that they depend on.

Evolene will then copy these packages into the project and allow them
to be referenced during `npm ci`.

TODO: Move all the logic in `bin/update.sh` to this package.