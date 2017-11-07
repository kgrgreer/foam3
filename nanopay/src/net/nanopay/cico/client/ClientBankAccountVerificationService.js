foam.CLASS({
  package: 'net.nanopay.cico.client',
  name: 'ClientBankAccountVerificationService',

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.cico.service.BankAccountVerificationInterface',
      name: 'delegate'
    }
  ]
});
