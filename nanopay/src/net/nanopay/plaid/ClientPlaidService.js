foam.CLASS({
  package: 'net.nanopay.plaid',
  name: 'ClientPlaidService',

  implements: [
    'net.nanopay.plaid.PlaidService'
  ],

  javaImports: [
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.plaid.PlaidService',
      name: 'delegate'
    }
  ]
})
