foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'SecurityBucketPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `A planner for planning securities bucket type transactions. Each specified security is added as a
   a composite child transaction to the bucket transaction`,

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.tx.Amount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.BucketTransaction',
    'net.nanopay.tx.CompositeTransaction',
  ],


  methods: [
    {
      name: 'plan',
      javaCode: `
        BucketTransaction tx = (BucketTransaction) requestTxn;
        CompositeTransaction comp = new CompositeTransaction();
        comp.setIsQuoted(true);

        for ( Amount amnt : tx.getSubTransactions() ) {
          Transaction tSub = new Transaction();
          tSub.copyFrom(tx);
          tSub.setSourceCurrency(amnt.getUnit());
          tSub.setDestinationCurrency(amnt.getUnit());
          tSub.setAmount(amnt.getQuantity());
          comp.addNext(quoteTxn(x, tSub));
        }

        tx.addNext(comp);
        return tx;
      `
    },
  ]
});
