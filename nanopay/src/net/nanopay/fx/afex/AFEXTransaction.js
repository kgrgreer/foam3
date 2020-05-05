/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXTransaction',
  extends: 'net.nanopay.fx.FXTransaction',

  documentation: `Hold AFEX specific properties`,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.documents.AcceptanceDocument',
    'net.nanopay.documents.AcceptanceDocumentType',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.model.Business',
    'foam.core.Currency',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      class: 'Long',
      name: 'afexTradeResponseNumber',
      documentation: 'id of the AFEX trade response'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'initialStatus',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      name: 'statusChoices',
      hidden: true,
      documentation: 'Returns available statuses for each transaction depending on current status',
      factory: function() {
        if ( this.status == this.TransactionStatus.COMPLETED ) {
          return [
            'choose status',
            ['DECLINED', 'DECLINED']
          ];
        }
        if ( this.status == this.TransactionStatus.PENDING ) {
          return [
            'choose status',
            ['COMPLETED', 'COMPLETED'],
            ['DECLINED', 'DECLINED']
          ];
        }
        if ( this.status == this.TransactionStatus.SENT ) {
                  return [
                    'choose status',
                    ['COMPLETED', 'COMPLETED'],
                    ['DECLINED', 'DECLINED']
                  ];
                }
       return ['No status to choose'];
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.fx.afex.AFEXPaymentStatus',
      name: 'afexPaymentStatus',
      value: 'PENDING'
    },
  ],

  methods: [
    {
      name: 'findRootTransaction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'transaction',
          type: 'net.nanopay.tx.model.Transaction '
        }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
      Transaction txn = transaction;
      Transaction parent = txn;
      while ( txn != null ) {
        parent = txn;
        txn = (Transaction) parent.findParent(x);
      }
      return parent;
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
      setAfexTradeResponseNumber(((AFEXTransaction) other).getAfexTradeResponseNumber());
      setCompletionDate(other.getCompletionDate());
      setLineItems(other.getLineItems());
      `
    }
  ],
});
