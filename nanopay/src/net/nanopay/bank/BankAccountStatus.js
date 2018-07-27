foam.ENUM({
  package: 'net.nanopay.bank',
  name: 'BankAccountStatus',

  documentation: 'Types for Bank account status',

  values: [
    {
      name: 'UNVERIFIED',
      label: 'Unverified'
    },
    {
      name: 'VERIFIED',
      label: 'Verified'
    },
    {
      name: 'DISABLED',
      label: 'Disabled'
    }
  ]
});
