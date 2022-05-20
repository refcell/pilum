import calculateExchangeRate from 'ExchangeRate';

// Top-level Script Execution
(async () => {
  // IMMUTABLES
  const CDAI_NAME = 'cDAI';
  const DAI_NAME = 'DAI';

  // Calculate the exchange rate of cDAI to DAI
  console.log(
    'Using pilum Multicall to calculate the exchange rate of cDAI to DAI'
  );
  // NOTE: errors if the exchange quantity overflows from BigNumber to number
  const amount = await calculateExchangeRate(CDAI_NAME, DAI_NAME);
  console.log(`1 ${CDAI_NAME} can be redeemed for ${amount} ${DAI_NAME}`);

  // TODO: Calculate APY Using Rate Per Block

  return;
})();
