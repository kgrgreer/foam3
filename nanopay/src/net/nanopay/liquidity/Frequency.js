foam.ENUM({
  package: 'net.nanopay.liquidity',
  name: 'Frequency',

  documentation: 'Frequency for account liquidity.',

  values: [
    { name: 'DAILY',           label: 'Daily' },
    { name: 'WEEKLY',          label: 'Weekly' },
    { name: 'PER_TRANSACTION', label: 'Per Transaction' }
  ]
});
