foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'AFXNewYorkDisclosure',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  properties: [
    {
      name: 'title',
      value: 'AFX New York Disclosure'
    },
    {
      name: 'checkboxText',
      value: 'I agree to '
    },
    {
      name: 'country',
      value: 'US'
    },
    {
      name: 'state',
      value: 'NY'
    },
    {
      name: 'transactionType',
      value: 'AscendantFXTransaction'
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .AFXNewYorkDisclosure.AGREEMENT, true);
          },
          errorString: 'Must acknowledge the Disclosure.'
        }
      ]
    }
  ]
});
