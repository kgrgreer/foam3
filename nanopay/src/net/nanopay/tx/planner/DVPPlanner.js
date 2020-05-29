foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'DVPPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'A planner for planning Delivery vs. Payment (DVP) type transactions',

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.DVPTransaction',
    'net.nanopay.tx.SecurityTransaction'
  ],

  properties: [
    {
      name: 'bestPlan',
      value: true
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `

        DVPTransaction tx = (DVPTransaction) requestTxn.fclone();
        SecurityTransaction fop = new SecurityTransaction();
        Transaction dt = new Transaction.Builder(x).build();

        // create the FOP transaction
        fop.setSourceAccount(tx.getSourceAccount());
        fop.setDestinationAccount(tx.getDestinationAccount());
        fop.setSourceCurrency(tx.getSourceCurrency());
        fop.setDestinationCurrency(tx.getDestinationCurrency());
        fop.setAmount(tx.getAmount());
        tx.addNext(quoteTxn(x, fop));

        //create the Payment digital transaction
        dt.setSourceAccount(tx.getSourcePaymentAccount());
        dt.setDestinationAccount(tx.getDestinationPaymentAccount());
        dt.setSourceCurrency(dt.findSourceAccount(x).getDenomination());
        // may not be able to find destination account with user context so use getX();
        dt.setDestinationCurrency(dt.findDestinationAccount(getX()).getDenomination());

        dt.setAmount(tx.getPaymentAmount());
        dt.setDestinationAmount(tx.getDestinationPaymentAmount());

        tx.addNext(quoteTxn(x, dt));

        return tx;
      `
    }
  ]
});
