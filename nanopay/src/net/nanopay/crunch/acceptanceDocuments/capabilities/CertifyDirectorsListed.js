foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'CertifyDirectorsListed',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  messages: [
    { name: 'CERTIFY_DIRECTORS_LISTED', message: 'You must certify that all directors have been listed or your business does not require Director information.' },
    { name: 'TITLE_MSG', message: 'all directors have been listed or my business does not require Director information.' }
  ],

  properties: [
    {
      name: 'checkboxText',
      factory: function() {
        return this.I_CERTIFY;
      }
    },
    {
      name: 'title',
      factory: function() {
        return this.TITLE_MSG;
      }
    },
    {
      name: 'fileId',
      factory: function() {
        return '188eedba-b34a-4b61-9f6d-1c501f13dcc0';
      }
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
