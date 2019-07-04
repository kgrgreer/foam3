foam.CLASS({
  package: 'net.nanopay.cico.service',
  name: 'ClientBankAccountVerifierService',

  implements: [
    'net.nanopay.cico.service.BankAccountVerifier'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.cico.service.BankAccountVerifier',
      name: 'delegate'
    }
  ]
});
