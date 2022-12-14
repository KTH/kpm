# cellus-release

Set the version to be release to:

STAGE:

- version: ^1.0.0

ACTIVE:

- version: ~1.0.0

And let your docker.conf version be:
version: 1.0

Now to release a new version just run:

```sh
npm cellus-release
```

This will happen:

1. We will check that you are on main

2. The package will get a tag on main with the current version

3. The tag and repo will be pushed

4. We will print the current version so you can update cellus registry

5. docker.conf will be updated one minor version and committed

Further commits will only be published to STAGE.
