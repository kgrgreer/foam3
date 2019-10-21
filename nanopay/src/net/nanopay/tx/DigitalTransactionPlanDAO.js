/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DigitalTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Plans Digital transactions',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.util.SafetyUtil',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.util.List',
    'java.util.ArrayList',
  ],
  
  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
    public DigitalTransactionPlanDAO(X x, DAO delegate) {
      setX(x);
      setDelegate(delegate);
      System.err.println("Direct constructor use is deprecated. Use Builder instead.");
    }
        `);
      }
    }
  ],
  
  methods: [
    {
      name: 'put_',
      javaCode: `

    TransactionQuote quote = (TransactionQuote) obj;
    Transaction txn = quote.getRequestTransaction();
    if ( quote.getSourceAccount() instanceof DigitalAccount &&
         quote.getDestinationAccount() instanceof DigitalAccount &&
         SafetyUtil.equals(txn.getSourceCurrency(), txn.getDestinationCurrency()) ) {
      Transaction dt;
      if ( ! ( txn instanceof DigitalTransaction ) ) {
        dt = new DigitalTransaction.Builder(x).build();
        dt.copyFrom(txn);
      } else {
        dt = (Transaction) txn.fclone();
      }
      dt.setTransfers(createTransfers(x, dt));
      dt.setIsQuoted(true);
      quote.addPlan(dt);
    }
    return super.put_(x, quote);
    `
    },
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'txn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        List all = new ArrayList();
        all.add(new Transfer.Builder(x).setAccount(txn.getSourceAccount()).setAmount(-txn.getTotal()).build());
        all.add(new Transfer.Builder(x).setAccount(txn.getDestinationAccount()).setAmount(txn.getTotal()).build());
        return (Transfer[]) all.toArray(new Transfer[0]);
      `
    }
  ]
});

