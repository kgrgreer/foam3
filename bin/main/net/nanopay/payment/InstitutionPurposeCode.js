foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'InstitutionPurposeCode',
  documentation: 'Institution specific Transaction Purpose Code.' +
      ' Mapped from Institution/Processor and Transaction Purpose Code',

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50
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
      documentation: 'Reference to institution associated to purpose code.',
      label: 'Institution'
    },
    {
      class: 'String',
      documentation: 'Body of text explaining the purpose code.',
      name: 'code'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.TxnProcessor',
      name: 'txnProcessorId',
      label: 'Payment Platform',
      documentation: 'Platform specifying purpose code.'
    }
  ]
});
