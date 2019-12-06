foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'SecurityCIplanner',
  documentation: 'A planner for ingesting securities',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.SecurityTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.SecuritiesAccount',
    'net.nanopay.account.SecuritiesTrustAccount',
        'net.nanopay.account.BrokerAccount',
    'java.util.List',
    'java.util.ArrayList',
    'foam.dao.DAO',

  ],


  methods: [
    {
      name: 'applyAction',
      javaCode: `
        TransactionQuote txq = (TransactionQuote) obj;
        // --> Probably not needed.   Transaction tx = txq.getRequestTransaction();
        SecurityTransaction plan = new SecurityTransaction.Builder(x).build();

        DAO accountDAO = (DAO) x.get("accountDAO");
        Account secTrust = accountDAO.find(INSTANCE_OF(SecuritiesTrustAccount));

        plan.setSourceCurrency(txq.getSourceUnit());
        plan.setDestinationCurrency(txq.getDestinationUnit());

        plan.setSourceAccount(txq.getSourceAccount().getId()); //TODO add the security so we know which account to actually get.
        plan.setDestinationAccount(txq.getDestinationAccount().getId());



        if ( txq.getSourceAccount() instanceof brokerAccount ) { // cashin
          plan.setTransfers(createTransfers_(getX(), plan,
            ((SecuritiesAccount) txq.getSourceAccount()).getSecurityAccount(x,txq.getSourceUnit()).getId(),
            secTrust.getId(), true)
          );
          plan.setIsQuoted(true);
          txq.addPlan(plan);
        }

        else if ( txq.getDestinationAccount() instanceof brokerAccount ) { //cashout
          plan.setTransfers(createTransfers_(getX(), plan,
            ((SecuritiesAccount) txq.getDestinationAccount()).getSecurityAccount(x,txq.getDestinationUnit()).getId(),
            secTrust.getId(), false)
          );
          plan.setIsQuoted(true);
          txq.addPlan(plan);
        }

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
          name: 'transferAcct',
          type: 'Long'
        },
        {
          name: 'transferTrust',
          type: 'Long'
        },
        {
          name: 'ci',
          type: 'Boolean'
        }
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

        if (ci) {
          all.add(new Transfer.Builder(x).setAccount(transferTrust).setAmount(-newPlan.getTotal()).build());
          all.add(new Transfer.Builder(x).setAccount(transferAcct).setAmount(newPlan.getTotal()).build());
        }

        else {
          all.add(new Transfer.Builder(x).setAccount(transferTrust).setAmount(newPlan.getTotal()).build());
          all.add(new Transfer.Builder(x).setAccount(transferAcct).setAmount(-newPlan.getTotal()).build());
        }

        return (Transfer[]) all.toArray(new Transfer[0]);
      `
    }
  ]
});
