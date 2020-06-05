foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'AbliiPrivacyPolicy',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  messages: [
    { name: 'ACKNOWLEDGE_PRIVACY_POLICY', message: 'Must acknowledge the Privacy Policy.' }
  ],

  properties: [
    {
      name: 'title',
      value: `Ablii's Privacy Policy`
    },
    {
      name: 'checkboxText',
      value: 'I agree to '
    },
    {
      name: 'link',
      value: 'https://nanopay.net/wp-content/uploads/2019/05/Ablii-by-nanopay-Privacy-Policy.pdf'
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .AbliiPrivacyPolicy.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_PRIVACY_POLICY'
        }
      ]
    }
  ]
});
