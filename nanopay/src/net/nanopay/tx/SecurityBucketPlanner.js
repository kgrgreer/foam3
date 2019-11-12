foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'SecurityBucketPlanner',
  documentation: 'A planner for planning securities bucket type transactions. Each specified security is added as ',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.dao.DAO',
    'net.nanopay.tx.SecurityTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.BucketTransaction',
    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.tx.Amount',
    'java.util.List',
    'java.util.ArrayList',

  ],


  methods: [
    {
      name: 'applyAction',
      javaCode: `
        TransactionQuote txq = (TransactionQuote) obj;
        BucketTransaction tx = (BucketTransaction) txq.getRequestTransaction();
        CompositeTransaction comp = new CompositeTransaction.Builder(x).build();
        DAO quoter = (DAO) x.get("localTransactionQuoteDAO");

        for (Amount amnt:tx.getSubTransactions()) {
          Transaction tSub = new Transaction.Builder(x).build();
          tSub.copyFrom(tx);
          tSub.setSourceCurrency(amnt.getUnit());
          tSub.setDestinationCurrency(amnt.getUnit());
          tSub.setAmount(amnt.getQuantity());
          TransactionQuote tq = new TransactionQuote();
          tq.setRequestTransaction(tSub);
          tq = (TransactionQuote) quoter.put(tq);
          comp.addNext(tq.getPlan());
        }

        tx.setIsQuoted(true);
        tx.setTransfers(null);
        tx.addNext(comp);
        txq.addPlan(tx);
      `
    },
  ]
});
