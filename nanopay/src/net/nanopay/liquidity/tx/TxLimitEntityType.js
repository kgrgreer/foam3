foam.ENUM({
  package: 'net.nanopay.liquidity.tx',
  name: 'TxLimitEntityType',
  documentation: 'Type of entity that will be limited by a transaction limit.',

  values: [
    {
      name: 'USER',
      label: 'User',
      documentation: 'Limits for users.'
    },
    {
      name: 'ACCOUNT',
      label: 'Account',
      documentation: 'Limits for accounts.'
    }
  ]
});
