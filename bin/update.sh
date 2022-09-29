#!/bin/sh
# Send a list of workspace folder names as arguments
workspaces="$@"

# Hide package.json from NPM
mv package.json package.json.tmp

# Generate package-lock.json files
for d in $workspaces
do
    (cd $d && npm i --package-lock-only)
done

# Reveal package.json to NPM
mv package.json.tmp package.json