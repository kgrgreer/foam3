foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'DualPartyAgreementCAD',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  properties: [
    {
      name: 'title',
      value: 'Dual Party Agreement for Ablii Canadian Payment Services'
    },
    {
      name: 'version',
      value: '1.0'
    },
    {
      name: 'issuedDate',
      factory: function() {
        return new Date('2019-02-01T00:00:00.0Z');
      }
    },
    {
      name: 'link',
      value: 'https://nanopay.net/wp-content/uploads/2019/05/nanopay-Canada-Dual-Agreement.pdf'
    },
    {
      name: 'checkboxText',
      value: 'I acknowledge that I have read and accept the '
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
              .DualPartyAgreementCAD.AGREEMENT, true);
          },
          errorString: 'Must acknowledge the Agreement above.'
        }
      ]
    }
  ]
});
