foam.CLASS({
  package: 'net.nanopay.account',
  name: 'Balance',
  ids: ['account'],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Long',
      name: 'balance',
      visibility: foam.u2.Visibility.RO
    }
  ]
});
