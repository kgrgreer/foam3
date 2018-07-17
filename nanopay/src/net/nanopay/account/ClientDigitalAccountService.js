foam.CLASS({
  package: 'net.nanopay.account',
  name: 'ClientDigitalAccountService',

  implements: [
    'net.nanopay.account.DigitalAccountInterface'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.account.DigitalAccountInterface',
      name: 'delegate'
    }
  ]
});
