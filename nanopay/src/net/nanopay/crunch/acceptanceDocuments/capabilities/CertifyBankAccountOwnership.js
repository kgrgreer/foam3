foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'CertifyBankAccountOwnership',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  properties: [
    {
      name: 'checkboxText',
      value: 'I certify that the account belongs to me or my business.'
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .CertifyBankAccountOwnership.AGREEMENT, true);
          },
          errorString: 'Must acknowledge the statement above.'
        }
      ]
    }
  ]
});
