foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'CertifyDirectorsListed',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  messages: [
    { name: 'CERTIFY_DIRECTORS_LISTED', message: 'You must certify that all directors have been listed.' }
  ],

  properties: [
    {
      name: 'checkboxText',
      value: 'I certify that all directors have been listed.'
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .CertifyDirectorsListed.AGREEMENT, true);
          },
          errorMessage: 'CERTIFY_DIRECTORS_LISTED'
        }
      ]
    }
  ]
});
