foam.ENUM({
  package: 'net.nanopay.bank',
  name: 'BankAccountStatus',

  documentation: 'The base model for tracking and managing the status of a bank account.',

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
