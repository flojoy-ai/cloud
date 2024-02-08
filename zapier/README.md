# To create a Zapier app with for Flojoy Cloud manually

Create a `.env` file in with cloud domain

```text
NEXT_PUBLIC_URL_ORIGIN="<cloud domain>"
```

- Install dependencies

```shell
    pnpm install
```

- Build the app

```shell
    pnpm build
```

- Upload to Zapier

  - Install Zapier CLI globally

```sh
    npm install -g zapier-platform-cli
```

- Login to Zapier account

```sh
    zapier login
```

- Build and deploy

```sh
    zapier build
    zapier upload
```
