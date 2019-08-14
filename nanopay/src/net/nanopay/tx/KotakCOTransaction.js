foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakCOTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

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
      name: 'IFSCCode'
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
      name: 'queryReqId'
    },
    {
      class: 'String',
      name: 'queryStatusCode'
    },
    {
      class: 'String',
      name: 'queryStatusDesc'
    },
    {
      class: 'String',
      name: 'UTRNumber'
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'net.nanopay.tx.TransactionLineItem',
      name: 'purposeCode'
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'net.nanopay.tx.TransactionLineItem',
      name: 'accountRelationship'
    }
  ],

  methods: [
    {
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
      return false;
      `
    },
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          javaType: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
      super.limitedCopyFrom(other);
      setAmount(((KotakCOTransaction) other).getAmount());
      `
    }
  ]
});
