# Aurorafs Dashboard

> An app which helps users to setup their Aurora node, upload and download files.

**Warning: This project is in alpha state. There might (and most probably will) be changes in the future to its API and
working. Also, no guarantees can be made about its stability, efficiency, and security at this stage.**

This project is intended to be used with **Aurora version 1.1.0**. Using it with older or newer Aurora versions is not
recommended and may not work. Stay up to date by joining the [official Discord](https://discord.com/invite/nDFnN6zScC)
and by keeping an eye on the [releases tab](https://github.com/gauss-project/aurorafs/releases).

![Info page](/ui_samples/info.png)

| Node Info | Files  | Peers | Setting |
|-------|---------|----------|------|
| ![Info](/ui_samples/info.png) | ![Files](/ui_samples/files.png) | ![Peers](/ui_samples/peers.png) | ![Setting](/ui_samples/setting.png) |

## Table of Contents

- [Usage](#usage)
- [Development](#development)
- [Contribute](#contribute)
- [License](#license)

## Usage

:warning: To successfully connect to the Aurora node, you will need to enable the Debug API and CORS. You can do so by
setting `cors-allowed-origins: ['*']` and `debug-api-enable: true` in the Aurora config file and then restart the Aurora
node. To see where the config file is, consult
the [official Aurora documentation](https://docs.aufs.io/docs/api-reference/api-and-debugapi)

### Development

```sh
## Installing the yarn toolkit
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update
sudo apt install yarn

## Start-up dashboard, start-up process takes 1-2 minutes
git clone https://github.com/gauss-project/aurorafs-dashboard.git
cd aurorafs-dashboard
yarn 
yarn start

## If you run the exe, enter the following command after yarn
yarn build
yarn electron

```

The Aurora Dashboard runs in development mode on [http://localhost:8000/](http://localhost:8000/)

## Contribute

There are some ways you can make this module better:

- Consult our [open issues](https://github.com/gauss-project/aurorafs-dashboard/issues) and take on one of them
- Help our tests reach 100% coverage!
- Join us in our [Discord chat](https://discord.com/invite/nDFnN6zScC) in the #technology channel if you have questions
  or want to give feedback

## License

This library is distributed under the BSD-style license found in the [LICENSE](LICENSE) file.



