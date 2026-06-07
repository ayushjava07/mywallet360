// moralis.service.js

import Moralis from "moralis";

await Moralis.start({
  apiKey: process.env.MORALIS_API_KEY
});

export async function getWalletProfile(address) {

  const [
    netWorth,
    tokens,
    nfts,
    history
  ] = await Promise.all([

    Moralis.EvmApi.wallets.getWalletNetWorth({
      address
    }),

    Moralis.EvmApi.token.getWalletTokenBalancesPrice({
      address
    }),

    Moralis.EvmApi.nft.getWalletNFTs({
      address
    }),

    Moralis.EvmApi.wallets.getWalletHistory({
      address
    })

  ]);

  const totalNetWorth =
    netWorth.raw.total_networth_usd;

  const nftCount =
    nfts.raw.result.length;

  let largestHolding = null;

  tokens.raw.forEach(token => {

    if (
      !largestHolding ||
      token.usd_value > largestHolding.usd_value
    ) {
      largestHolding = token;
    }

  });

  return {
    netWorth: totalNetWorth,
    nftCount,
    largestHolding
  };
}