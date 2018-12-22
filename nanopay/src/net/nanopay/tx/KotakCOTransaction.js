foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  documentation: `Hold Kotak Bank specific properties`,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'fxRate',
      class: 'Double'
    },
    {
      class: 'Currency',
      name: 'settlementAmount'
    },
    {
      class: 'String',
      name: 'kotakMsgId'
    },
    {
      class: 'String',
      name: 'instRefNo',
      documentation: 'Instruction Reference Number'
    },
    {
      class: 'String',
      name: 'chargeBorneBy',
      documentation: 'BEN (Beneficiary), OUR (Payer), SHA(Shared)'
    },
    {
      class: 'DateTime',
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
      documentation: 'Status Remarks which contains status description'
    },
    {
      class: 'String',
      name: 'instStatusCd',
      documentation: 'Instrument Status Code'
    },
    {
      class: 'String',
      name: 'instStatusRem',
      documentation: 'Instrument Status Remarks'
    },
    {
      class: 'StringArray',
      name: 'errorList'
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
      name: 'reversalReqId'
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
