foam.ENUM({
  package: 'net.nanopay.liquidity',
  name: 'Frequency',

  documentation: 'Frequency of auto CashOut.',

  values: [
    { name: 'DAILY',           label: 'Daily' },
    { name: 'WEEKLY',          label: 'Weekly' },
    { name: 'PER_TRANSACTION', label: 'Per Transaction' }
  ]
});
