foam.CLASS({
  package: 'net.nanopay.kotak',
  name: 'KotakCOTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  properties: [
    {
      class: 'String',
      name: 'chargeBorneBy',
      documentation: 'BEN (Beneficiary), OUR (Payer), SHA(Shared)'
    },
    {
      class: 'String',
      name: 'paymentMessageId'
    },
    {
      class: 'String',
      name: 'sentDate',
      documentation: 'Business date when the transaction was sent to Kotak'
    },
    {
      class: 'String',
      name: 'paymentStatusCode'
    },
    {
      class: 'String',
      name: 'paymentStatusRem',
      document: 'Status Remarks which contains status description'
    },
    {
      class: 'String',
      name: 'instRefNo',
      document: 'Instruction Reference Number'
    },
    {
      class: 'String',
      name: 'instStatusCd',
      document: 'Instrument Status Code'
    },
    {
      class: 'String',
      name: 'instStatusRem',
      document: 'Instrument Status Remarks'
    },
    {
      class: 'String',
      name: 'error'
    },
    {
      class: 'String',
      name: 'errorCode'
    },
    {
      class: 'String',
      name: 'errorReason'
    },
    {
      class: 'String',
      name: 'invalidFieldName'
    },
    {
      class: 'String',
      name: 'invalidFieldValue'
    },
    {
      class: 'String',
      name: 'reversalStatusCode'
    },
    {
      class: 'String',
      name: 'reversalStatusDesc'
    },
    {
      class: 'String',
      name: 'UTRNumber'
    }
  ]
});
