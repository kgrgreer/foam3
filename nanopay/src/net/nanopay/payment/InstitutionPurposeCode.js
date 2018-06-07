foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'InstitutionPurposeCode',
  documentation: 'Institution specific Transaction Purpose Code. Mapped from Institution/Processor and Transaction Purpose Code',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    // { via RELATIONSHIP
    //   class: 'Reference',
    //   of: 'net.nanopay.tx.TransactionPurpose',
    //   name: 'transactionPurposeId',
    //   label: 'Transaction Purpose'
    // },
    {
      class: 'Reference',
      of: 'net.nanopay.payment.Institution',
      name: 'institutionId',
      label: 'Institution'
    },
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.payment.PaymentPlatform',
      name: 'paymentPlatformId',
      label: 'Payment Platform'
    }
  ]
});
