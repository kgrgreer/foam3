foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DVPplanner',
  documentation: 'A planner for planning Delivery vs. Payment (DVP) type transactions',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.dao.DAO',
    'net.nanopay.tx.DVPTransaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.tx.SecurityTransaction',
    'net.nanopay.tx.Transfer',
    'foam.core.ContextAgent',
    'foam.core.X',
    'java.util.List',
    'java.util.ArrayList'
  ],


  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
        TransactionQuote txq = (TransactionQuote) obj;
        DVPTransaction tx = (DVPTransaction) txq.getRequestTransaction();
        SecurityTransaction fop = new SecurityTransaction.Builder(x).build();
        Transaction dt = new Transaction.Builder(x).build();
        DAO quoter = ((DAO) x.get("localTransactionQuotePlanDAO"));

        // create the FOP transaction
        fop.setSourceAccount(tx.getSourceAccount());
        fop.setDestinationAccount(tx.getDestinationAccount());
        fop.setSourceCurrency(tx.getSourceCurrency());
        fop.setDestinationCurrency(tx.getDestinationCurrency());
        fop.setAmount(tx.getAmount());
        TransactionQuote tq1 = new TransactionQuote.Builder(x).setRequestTransaction(fop).build();
        tq1 = (TransactionQuote) quoter.put(tq1);
        tx.addNext(tq1.getPlan());

        //create the Payment digital transaction
        dt.setSourceAccount(tx.getSourcePaymentAccount());
        dt.setDestinationAccount(tx.getDestinationPaymentAccount());
        dt.setSourceCurrency(dt.findSourceAccount(x).getDenomination());
        dt.setDestinationCurrency(dt.findDestinationAccount(x).getDenomination());
        dt.setAmount(tx.getPaymentAmount());
        dt.setDestinationAmount(tx.getDestinationPaymentAmount());

        TransactionQuote tq2 = new TransactionQuote.Builder(x).setRequestTransaction(dt).build();
        tq2 = (TransactionQuote) quoter.put(tq2);
        tx.addNext(tq2.getPlan());


        tx.setIsQuoted(true);
        tx.setTransfers(new Transfer[0]);
        txq.setPlan(tx);
        }}, "DVP Security Transaction Planner");
      `
    }
  ]
});
