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
    'foam.core.ContextAgent',
    'foam.core.X',
    'static foam.mlang.MLang.INSTANCE_OF'
  ],


  methods: [
    {
      name: 'applyAction',
      javaCode: `
        TransactionQuote txq = (TransactionQuote) obj;
        Transaction tx = txq.getRequestTransaction();
        // --> Probably not needed.   Transaction tx = txq.getRequestTransaction();
        agency.submit(x, new ContextAgent() {
                            @Override
                            public void execute(X x) {
        if ( txq.getSourceAccount() instanceof BrokerAccount ) { // cashin
        // -- do this better..
          SecurityTransaction plan = new SecurityTransaction.Builder(x).build();
          plan.copyFrom(tx);
          DAO accountDAO = (DAO) x.get("accountDAO");
          SecuritiesTrustAccount secTrust = (SecuritiesTrustAccount) accountDAO.find(INSTANCE_OF(SecuritiesTrustAccount.class));
          plan.setName("Security CI of "+txq.getSourceUnit());
          plan.setSourceCurrency(txq.getSourceUnit());
          plan.setDestinationCurrency(txq.getDestinationUnit());

          plan.setSourceAccount(txq.getSourceAccount().getId());
          plan.setDestinationAccount(txq.getDestinationAccount().getId());

        //--

          plan.setTransfers(createTransfers_(x, plan,
            ((SecuritiesAccount) txq.getDestinationAccount()).getSecurityAccount(x,txq.getDestinationUnit()).getId(),
            secTrust.getSecurityAccount(x,txq.getDestinationUnit()).getId(), true)
          );
          plan.setIsQuoted(true);
          txq.setPlan(plan);
        }


        else if ( txq.getDestinationAccount() instanceof BrokerAccount ) { //cashout

        // -- do this better..
          SecurityTransaction plan = new SecurityTransaction.Builder(x).build();
          plan.copyFrom(tx);
          DAO accountDAO = (DAO) x.get("accountDAO");
          SecuritiesTrustAccount secTrust = (SecuritiesTrustAccount) accountDAO.find(INSTANCE_OF(SecuritiesTrustAccount.class));

          plan.setSourceCurrency(txq.getSourceUnit());
          plan.setDestinationCurrency(txq.getDestinationUnit());
          plan.setName("Security CO of "+txq.getSourceUnit());
          plan.setSourceAccount(txq.getSourceAccount().getId());
          plan.setDestinationAccount(txq.getDestinationAccount().getId());

        //--



          plan.setTransfers(createTransfers_(x, plan,
            ((SecuritiesAccount) txq.getSourceAccount()).getSecurityAccount(x,txq.getSourceUnit()).getId(),
            secTrust.getSecurityAccount(x,txq.getSourceUnit()).getId(), false)
          );
          plan.setIsQuoted(true);
          txq.setPlan(plan);
          }
          }


        }, "Security CICO Planner");

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
          all.add(new Transfer.Builder(x).setAccount(transferTrust).setAmount(-newPlan.getAmount()).build());
          all.add(new Transfer.Builder(x).setAccount(transferAcct).setAmount(newPlan.getAmount()).build());
        }

        else {
          all.add(new Transfer.Builder(x).setAccount(transferTrust).setAmount(newPlan.getAmount()).build());
          all.add(new Transfer.Builder(x).setAccount(transferAcct).setAmount(-newPlan.getAmount()).build());
        }

        return (Transfer[]) all.toArray(new Transfer[0]);
      `
    }
  ]
});
