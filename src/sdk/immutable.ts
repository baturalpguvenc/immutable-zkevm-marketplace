import { blockchainData, config, orderbook, passport } from "@imtbl/sdk";
import { providers } from "ethers";

export const ENVIRONMENT_SDK = config.Environment.SANDBOX;
export const CHAIN_NAME: string = "imtbl-zkevm-testnet";

export const blockChainSDK = new blockchainData.BlockchainData({
  baseConfig: new config.ImmutableConfiguration({
    environment: ENVIRONMENT_SDK,
  }),
});

export const orderbookSDK = new orderbook.Orderbook({
  baseConfig: { environment: config.Environment.SANDBOX },
  overrides: {
    provider: new providers.JsonRpcProvider(
      // If white-listed; replace with the public rpc endpoint
      "https://rpc.testnet.immutable.com"
    ),
  },
});

export const passportSDK = new passport.Passport({
  baseConfig: new config.ImmutableConfiguration({
    environment: config.Environment.SANDBOX,
  }),
  // non production client id
  clientId: '4jz9egnVkDgdrYQZZH8yFuvbNY1GyqVb',
  // default next dev hosting
  redirectUri: 'http://localhost:3000',
  logoutRedirectUri: 'http://localhost:3000',
  audience: 'platform_api',
  scope: 'openid offline_access email transact'
});
