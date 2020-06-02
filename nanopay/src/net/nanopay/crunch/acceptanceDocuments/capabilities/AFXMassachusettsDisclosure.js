foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'AFXMassachusettsDisclosure',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  properties: [
    {
      name: 'title',
      value: 'AFX Massachusetts Disclosure'
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
      value: 'MA'
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
              .AFXMassachusettsDisclosure.AGREEMENT, true);
          },
          errorString: 'Must acknowledge the Disclosure.'
        }
      ]
    }
  ]
});
