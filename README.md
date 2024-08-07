# Wonderland Frontend Challenge

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First you need to set a Wallet Connect Project ID in `.env.local`

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=yourProjectId
```

To install packages and run the program, we recommend using `pnpm`

```bash
pnpm install
# then
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

### To run unit tests:

```bash
pnpm test:unit
```

### To run e2e tests

This project uses synpress, which requires a Metamask wallet. The e2e flow will open a browser window, install metamask and configure the wallet with the given 12 words. This wallet will need some Sepolia Eth to run the tests.

You need to add the following to `.env.local`

```
SECRET_WORDS="twelve words of the wallet to run tests from"
NETWORK_NAME=sepolia
```

PLEASE USE A WALLET THAT IS SOLELY FOR TESTING

You also need to create a file named `test-config.js` which exports the address you are going to be transfering funds and setting allowance to. This address needs to be a different address than the one providing the words.

`test-config.js`:

```
export const TARGET_WALLET = "0xReceivingWallet";
```

After that, run the project with

```
pnpm dev
```

and run the tests with

```
pnpm test:e2e
```

## Features

- Transfer, mint and set allowance for WT6_USDC and WT18_DAI
- Last transaction confirmation on screen
- Fetch balances and allowances only when needed and on transaction completion
- Built-in a11y improvements from the Radix library
- Mobile support
- Full TypeScript support (including ABIs)
- Wrong Network detection and huminized balances/allowances
