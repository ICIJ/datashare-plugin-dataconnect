# datashare-plugin-dataconnect

[![](https://img.shields.io/github/actions/workflow/status/icij/datashare-plugin-dataconnect/main.yml)](https://github.com/ICIJ/datashare-plugin-dataconnect/actions)

A Datashare plugin to create DataConnect, a bridge between Datashare and iHub.
To be used with [datashare-extension-dataconnect](https://github.com/ICIJ/datashare-extension-dataconnect/) and [custom-fields-api](https://github.com/ICIJ/custom-fields-api).

# New release

First, ensure that your local environment is up to date:

```
git pull origin main --rebase --tags
```

Then create a tag of the release:

```
yarn version --major
yarn version --minor
yarn version --patch
```

Push your tag: 

```
git push origin main --tags
```

The plugin is configured so that CircleCI manages the release. If your tag builds successfully in CircleCI, it will be published as a release automatically.
