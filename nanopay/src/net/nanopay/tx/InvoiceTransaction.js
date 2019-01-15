foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'InvoiceTransaction',
  extends: 'net.nanopay.tx.DigitalTransaction',

  javaImports: [
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction',
    'java.util.List',
    'java.util.ArrayList'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'payable',
      documentation: 'Represents payable/receivable invoice. Receivable is default.'
    },
    {
      class: 'Double', // REVIEW
      name: 'serviceCompleted',
      value: 100,
      javaValue: '100',
      documentation: 'Percentage of how much work was done.'
    },
    {
      class: 'Long',
      name: 'serviceId',
      documentation: 'Reference to service that is being paid'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    }
  ],

  methods: [
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'oldTxn',
          javaType: 'Transaction'
        }
      ],
      javaReturns: 'Transfer[]',
      javaCode: `
        List all = new ArrayList();
        TransactionLineItem[] lineItems = getLineItems();
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          Transfer[] transfers = lineItem.createTransfers(x, oldTxn, this, getStatus() == TransactionStatus.REVERSE);
          for ( int j = 0; j < transfers.length; j++ ) {
            all.add(transfers[j]);
          }
        }
        all.add(new Transfer.Builder(x)
          .setDescription("Invoice transaction")
          .setAccount(getSourceAccount())
          .setAmount((long)(-getTotal()*getServiceCompleted()*0.01))
          .build());
        all.add( new Transfer.Builder(getX())
            .setDescription("Invoice transaction")
            .setAccount(getDestinationAccount())
            .setAmount((long)(getTotal()*getServiceCompleted()*0.01))
            .build());
        Transfer[] transfers = getTransfers();
        for ( int i = 0; i < transfers.length; i++ ) {
          all.add(transfers[i]);
        }
        return (Transfer[]) all.toArray(new Transfer[0]);
      `
    },
    {
      documentation: `return true when status change is such that normal (forward) Transfers should be executed (applied)`,
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'oldTxn',
          javaType: 'Transaction'
        }
      ],
      javaReturns: 'Boolean',
      javaCode: `
        return oldTxn == null && getStatus() == TransactionStatus.COMPLETED;
      `
    }
  ]
});
