foam.CLASS({
    package: 'net.nanopay.tx.ruler',
    name: 'InvoiceTransactionAfterPutRule',

    documentation: 'Invoice transaction after put rule.',

    implements: [
      'foam.nanos.ruler.RuleAction'
    ],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'net.nanopay.tx.InvoiceTransaction',
      'net.nanopay.tx.model.TransactionStatus',
      'net.nanopay.tx.TransactionLineItem'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            InvoiceTransaction oldTxn = (InvoiceTransaction) oldObj;
            InvoiceTransaction txn    = (InvoiceTransaction) obj;

            if ( txn.getServiceCompleted() == 100 ) {
              return;
            }
            InvoiceTransaction child = new InvoiceTransaction();
            child.copyFrom(txn);
            child.setId("");
            child.setServiceCompleted(100);
            child.setStatus(TransactionStatus.PENDING);

            TransactionLineItem[] lineItems = oldTxn.getLineItems();
            for ( int i = 0; i < lineItems.length; i++ ) {
              lineItems[i].setAmount((long)(lineItems[i].getAmount()*0.01*(100 - txn.getServiceCompleted())));
            }
            child.setLineItems(lineItems);
            txn.getChildren(x).put(child);
          }
        }, "Invoice Transaction After Put Logic");
        `
      }
    ]
  });
