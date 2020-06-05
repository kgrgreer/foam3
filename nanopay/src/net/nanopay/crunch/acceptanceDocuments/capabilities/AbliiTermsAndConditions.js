foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'AbliiTermsAndConditions',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  messages: [
    { name: 'ACKNOWLEDGE_ABLII_TC', message: 'Must acknowledge the Terms and Conditions.' }
  ],

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
          errorMessage: 'ACKNOWLEDGE_ABLII_TC'
        }
      ]
    }
  ]
});
