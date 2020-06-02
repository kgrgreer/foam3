foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'AbliiTermsAndConditions',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  properties: [
    {
      name: 'title',
      value: `Ablii's Terms and Conditions`
    },
    {
      name: 'checkboxText',
      value: 'I agree to '
    },
    {
      name: 'link',
      value: 'https://nanopay.net/wp-content/uploads/2019/05/Ablii-by-nanopay-Terms-of-Service-Agreement.pdf'
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .AbliiTermsAndConditions.AGREEMENT, true);
          },
          errorString: 'Must acknowledge the Terms and Conditions.'
        }
      ]
    }
  ]
});
