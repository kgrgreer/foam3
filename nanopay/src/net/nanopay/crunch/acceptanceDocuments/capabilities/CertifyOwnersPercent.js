foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'CertifyOwnersPercent',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  messages: [
    { name: 'CERTIFY_OWNER_PERCENTAGE', message: 'You must certify that all beneficial owners with 25% or more ownership have been listed.' }
  ],

  properties: [
    {
      name: 'checkboxText',
      value: 'I certify that any beneficial owners with 25% or more ownership have been listed and the information included about them is accurate.'
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .CertifyOwnersPercent.AGREEMENT, true);
          },
          errorMessage: 'CERTIFY_OWNER_PERCENTAGE'
        }
      ]
    }
  ]
});
