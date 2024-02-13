# To create a Zapier app with for Flojoy Cloud manually

## Install dependencies

```shell
    pnpm install
```

- Build the app

```shell
    pnpm build
```

## Upload to Zapier

- Install Zapier CLI globally

```sh
    npm install -g zapier-platform-cli
```

- Login to Zapier account

```sh
    zapier login
```

- Register the app

```sh
    zapier register <app name>
```

- Build and deploy

```sh
    zapier push
```

- Setup env values

```sh
    zapier env:set 1.0.0 CLIENT_ID=<zapier_client_id> CLIENT_SECRET=<zapier_client_secret> URL_ORIGIN=<cloud_domain>
```

**NOTE**: You must set `ZAPIER_CLIENT_ID` and `ZAPIER_CLIENT_SECRET` env in cloud app and use same values here for `CLIENT_ID` and `CLIENT_SECRET` for authorization to work.
