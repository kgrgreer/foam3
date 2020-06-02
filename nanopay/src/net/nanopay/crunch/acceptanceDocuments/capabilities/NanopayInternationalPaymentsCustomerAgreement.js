foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments.capabilities',
  name: 'NanopayInternationalPaymentsCustomerAgreement',
  extends: 'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',

  properties: [
    {
      name: 'title',
      value: 'nanopay international Payments Customer Agreement'
    },
    {
      name: 'checkboxText',
      value: 'I acknowledge that I have read and accept the '
    },
    {
      name: 'link',
      value: 'https://ablii.com/wp-content/uploads/2019/08/Sep-2019-nanopay-International-Payments-Customer-Agreement.pdf'
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
              .NanopayInternationalPaymentsCustomerAgreement.AGREEMENT, true);
          },
          errorString: 'Must acknowledge the Agreement above.'
        }
      ]
    }
  ]
});
