foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'FOPplanner',
  documentation: 'A planner for planning Free of Payment (FOP) type transactions',
  
  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.SecurityTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.SecuritiesAccount',
    'net.nanopay.account.BrokerAccount',
    'java.util.List',
    'java.util.ArrayList',
    'foam.util.SafetyUtil'
  ],


  methods: [
    {
      name: 'applyAction',
      javaCode: `
        TransactionQuote txq = (TransactionQuote) obj;
          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              Transaction tx = txq.getRequestTransaction();
                if ( (! ( txq.getSourceAccount() instanceof BrokerAccount ) ) && (! (txq.getDestinationAccount() instanceof BrokerAccount ) ) && SafetyUtil.equals(txq.getSourceUnit(), txq.getDestinationUnit() )  ) {
                  SecurityTransaction plan = new SecurityTransaction.Builder(x).build();

                  plan.copyFrom(tx);
                  plan.setName("Digital Security Transaction");
                  plan.setSourceCurrency(txq.getSourceUnit());
                  plan.setDestinationCurrency(txq.getDestinationUnit());

                  plan.setAmount(tx.getAmount());
                  plan.setDestinationAmount(tx.getAmount());

                  plan.setSourceAccount(txq.getSourceAccount().getId());
                  plan.setDestinationAccount(txq.getDestinationAccount().getId());


                  plan.setIsQuoted(true);
                  plan.setTransfers(
                    createTransfers_(x, plan,
                    ((SecuritiesAccount) txq.getSourceAccount()).getSecurityAccount(x,txq.getSourceUnit()).getId(),
                    ((SecuritiesAccount) txq.getDestinationAccount()).getSecurityAccount(x,txq.getDestinationUnit()).getId()
                  ));

                  txq.setPlan(plan);
                }
              }}, "FOP Security Planner");

      `
    },
    {
      name: 'createTransfers_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'newPlan',
          type: 'net.nanopay.tx.SecurityTransaction'
        },
        {
          name: 'transferFrom',
          type: 'Long'
        },
        {
          name: 'transferTo',
          type: 'Long'
        },
      ],
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        List all = new ArrayList();
        TransactionLineItem[] lineItems = newPlan.getLineItems();
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          Transfer[] transfers = lineItem.createTransfers(x, null, newPlan);
          for ( int j = 0; j < transfers.length; j++ ) {
            all.add(transfers[j]);
          }
        }
        all.add(new Transfer.Builder(x).setAccount(transferFrom).setAmount(-newPlan.getAmount()).build());
        all.add(new Transfer.Builder(x).setAccount(transferTo).setAmount(newPlan.getAmount()).build());
        return (Transfer[]) all.toArray(new Transfer[0]);
      `
    }
  ]
});
