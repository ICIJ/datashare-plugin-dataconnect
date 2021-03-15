# datashare-plugin-dataconnect
[![CircleCI](https://circleci.com/gh/ICIJ/datashare-plugin-dataconnect.svg?style=shield)](https://circleci.com/gh/ICIJ/datashare-plugin-dataconnect)

A Datashare plugin to create DataConnect, a bridge between Datashare and iHub.
To be used with [datashare-extension-dataconnect](https://github.com/ICIJ/datashare-extension-dataconnect/) and [custom-fields-api](https://github.com/ICIJ/custom-fields-api).

# to create a new release 

First, ensure that your local environment is up to date:

`git pull origin main --rebase --tags`

Then create a tag of the release:

`git tag [version number]`

Ensure that your tag is registered:

`git tag -l`

Push your tag: 

`git push origin main --tags`

The plugin is configured so that CircleCI manages the release. If your tag builds successfully in CircleCI, it will be published as a release automatically.
