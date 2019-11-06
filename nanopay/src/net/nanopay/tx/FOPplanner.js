foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'FOPplanner',
  documentation: 'A planner for planning FOP type transactions',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.SecurityTransaction',
  ],


  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Transaction tx = (Transaction) obj.getRequestTransaction();
        Transaction plan = new SecurityTransaction.Builder(x).build();
        plan.setSourceCurrency(obj.getSourceDenomination());
        plan.setDestinationCurrency(obj.getDestinationDenomination());

        plan.setSourceAccount(obj.getSourceAccount()); //TODO add the security so we know which account to actually get.
        plan.setDestinationAccount(obj.getDestinationAccount());

        plan.setIsQuoted(true);
        plan = createTransfers_(getX(), plan));
        obj.addPlan(plan);
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
          name: 'newPlan'
          type: 'net.nanopay.tx.SecurityTransaction'
        },
      ],
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        List all = new ArrayList();
        TransactionLineItem[] lineItems = getLineItems();
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          Transfer[] transfers = lineItem.createTransfers(x, null, newPlan, false);
          for ( int j = 0; j < transfers.length; j++ ) {
            all.add(transfers[j]);
          }
        }

        all.add(new Transfer.Builder(x).setAccount(newPlan.getSourceAccount()).setAmount(-newPlan.getTotal).build());
        all.add(new Transfer.Builder(x).setAccount(newPlan.getDestinationAccount()).setAmount(newPlan.getTotal).build());
        return (Transfer[]) all.toArray(new Transfer[0]);
      `
    },

});
