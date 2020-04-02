foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'SummaryPopulatorDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    Populates the summary transaction with lineitems and transfer stuff from all child txns
  `,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.Transfer',
    'java.util.ArrayList',
    'java.util.List',
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( ! ( obj instanceof TransactionQuote ) ) {
          return getDelegate().put_(x, obj);
        }
        TransactionQuote quote = (TransactionQuote) obj;
        for ( Transaction t : quote.getPlans() ) {
          if ( t instanceof SummaryTransaction || t instanceof FXSummaryTransaction ) {
            List trans = new ArrayList<Transfer>();
            List items = new ArrayList<TransactionLineItem>();

            walk(t, trans, items);

            t.setTransfers((Transfer[]) trans.toArray(new Transfer[0]));
            t.setLineItems((TransactionLineItem[]) items.toArray(new TransactionLineItem[0]));
          }
        }
        return getDelegate().put_(x, quote);
      `
    },
    {
      name: 'walk',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'transfers', type: 'List' },
        { name: 'lineItems', type: 'List' },
      ],
      documentation: 'Recursivly walk the tree of transactions and add up transfers and lineitems',
      javaCode: `
      for (Transfer a : txn.getTransfers())
        transfers.add(a);
      for (TransactionLineItem a : txn.getLineItems())
        lineItems.add(a);

      if ( txn.getNext() != null && txn.getNext().length > 0)
        for ( Transaction t2 : txn.getNext() )
          walk(t2, transfers, lineItems);
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public SummaryPopulatorDAO(foam.core.X x, foam.dao.DAO delegate) {
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});
