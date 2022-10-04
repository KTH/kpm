#!/bin/bash
# Send a list of workspace folder names as arguments
workspaces="$@"

# Inject local packages
echo "Inject local packages"
npx ts-node --esm packages/evolene-local-packages/index.ts

# Hide package.json from NPM
mv package.json package.json.tmp

# Generate package-lock.json files and clean up
for d in $workspaces
do
    (cd $d && npm i --package-lock-only)
    if [ -d "$d/evolene_local_packages" ]; then
        (rm -rf "$d/evolene_local_packages")
    fi
    if [ -f "$d/package.json.bak" ]; then
        (mv "$d/package.json.bak" "$d/package.json")
    fi
done

# Reveal package.json to NPM
mv package.json.tmp package.json