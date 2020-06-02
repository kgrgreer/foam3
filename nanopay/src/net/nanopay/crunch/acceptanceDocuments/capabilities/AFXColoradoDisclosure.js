foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'AFXColoradoDisclosure',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  properties: [
    {
      name: 'title',
      value: 'AFX Colorado Disclosure'
    },
    {
      name: 'checkboxText',
      value: 'I agree to '
    },
    {
      name: 'transactionType',
      value: 'AscendantFXTransaction'
    },
    {
      name: 'country',
      value: 'US'
    },
    {
      name: 'state',
      value: 'CO'
    },
    {
      name: 'agreement',
      validationPredicates: [
        {
          args: ['agreement'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.acceptanceDocuments.capabilities
              .AFXColoradoDisclosure.AGREEMENT, true);
          },
          errorString: 'Must acknowledge the Disclosure.'
        }
      ]
    }
  ]
});
