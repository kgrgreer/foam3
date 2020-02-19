foam.CLASS({
  package: 'net.nanopay.account',
  name: 'Balance',
  ids: ['account'],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'balance',
      visibility: 'RO'
    }
  ]
});
