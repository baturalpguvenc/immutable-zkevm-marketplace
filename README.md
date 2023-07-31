# Immutable zkEVM Example Marketplace


## Getting Started
Install the dependencies:
```bash
yarn
```
Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Notes
 - Ensure the RPC url is correct in the docs
 - How are Aqua and TT going to get access to service URLs, currently still firewalled?
 - Automated network switcher not working - ensure connection details are added to Metamask first
 - API URL is not redirecting - this is the endpoint actually required right now: https://order-book-mr.sandbox.imtbl.com/v1/chains/imtbl-zkevm-testnet/orders/listings
