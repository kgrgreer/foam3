foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'TriPartyAgreementCAD',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  properties: [
    {
      name: 'title',
      value: 'Tri-Party Agreement for Ablii Payment Services - Canada Agreement'
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
      value: 'https://ablii.com/wp-content/uploads/2019/02/Tri-Party-Agreeement-for-Nanopay.AscendantFX-Service-Canada-01.28.2019-FINAL.pdf'
    },
    {
      name: 'checkboxText',
      value: 'I acknowledge that I have read and accept the above '
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
              .TriPartyAgreementCAD.AGREEMENT, true);
          },
          errorString: 'Must acknowledge the agreement above.'
        }
      ]
    }
  ]
});
