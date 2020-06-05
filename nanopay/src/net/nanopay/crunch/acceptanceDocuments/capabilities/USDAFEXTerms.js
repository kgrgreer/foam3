foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'USDAFEXTerms',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  messages: [
    { name: 'ACKNOWLEDGE_AFEX_AGREEMENT', message: 'Must acknowledge the AFEX agreement.' }
  ],

  properties: [
    {
      name: 'title',
      value: `AFEX terms and conditions`
    },
    {
      name: 'checkboxText',
      value: 'I acknowledge that both domestic and international payments are authorized and provided by AFEX and not nanopay. I certify that all statements provided are true and correct and I have obtained consent to submit all personal information provided. I have read, understood and agree to '
    },
    {
      name: 'link',
      value: 'https://sf-asset-manager.s3.amazonaws.com/95763/16388/2328.pdf'
    },
    {
      name: 'version',
      value: '1.0'
    },
    {
      name: 'issuedDate',
      factory: function() {
        return new Date('2019-08-09T00:00:00.0Z');
      }
    },
    {
      name: 'transactionType',
      value: 'AFEX'
    },
    {
      name: 'country',
      value: 'US'
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .USDAFEXTerms.AGREEMENT, true);
          },
          errorMessage: 'ACKNOWLEDGE_AFEX_AGREEMENT'
        }
      ]
    }
  ]
});
