foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'GenericFXPlanDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `This Planner is for transactions from any currency to any different currency. It takes any FXTransaction type.`,

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

   javaImports: [
     'foam.util.SafetyUtil',
     'net.nanopay.account.TrustAccount',
     'net.nanopay.tx.model.Transaction',
     'net.nanopay.tx.TransactionQuote',
     'net.nanopay.tx.Transfer',
     'net.nanopay.tx.model.TransactionStatus',
     'java.util.ArrayList',
     'java.util.List'
  ],

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    }
  ],

   methods: [
    {
      name: 'put_',
      javaCode: `
      if (getEnabled()) {
        TransactionQuote quote = (TransactionQuote) obj;
        if (quote.getRequestTransaction() instanceof FXTransaction ){
          FXTransaction txn = (FXTransaction) quote.getRequestTransaction();
          if ( ! SafetyUtil.equals(txn.getSourceCurrency(),txn.getDestinationCurrency())){
            // has source and destination but no rate or has all 3.
            if ( ! SafetyUtil.equals(txn.getAmount(),0) &&  ! SafetyUtil.equals(txn.getDestinationAmount(),0)) {
              if (SafetyUtil.equals(txn.getFxRate(),0))
                txn.setFxRate((long)(txn.getDestinationAmount()/txn.getAmount()));
              quote.addPlan(buildFxTransaction_(x,txn));
              return super.put_(x,quote);
            }

               // no source but has rate and destination.
            if ( SafetyUtil.equals(txn.getAmount(),0) &&  ! SafetyUtil.equals(txn.getDestinationAmount(),0) && ! SafetyUtil.equals(txn.getFxRate(),0)) {
              txn.setAmount((long)(txn.getDestinationAmount()/txn.getFxRate()));
              quote.addPlan(buildFxTransaction_(x,txn));
              return super.put_(x,quote);
            }
              // no destination but has rate and source.
            if ( ! SafetyUtil.equals(txn.getAmount(),0) &&  SafetyUtil.equals(txn.getDestinationAmount(),0)&& ! SafetyUtil.equals(txn.getFxRate(),0)) {
              txn.setDestinationAmount((long)(txn.getAmount()*txn.getFxRate()));
              quote.addPlan(buildFxTransaction_(x,txn));
              return super.put_(x,quote);
            }
          }
        }
      }
      return super.put_(x, obj);
    `
    },
    {
      name: 'buildFxTransaction_',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'txn',
          type: 'net.nanopay.fx.FXTransaction'
        }
      ],
      type: 'net.nanopay.fx.FXTransaction',
      javaCode:`
        List all = new ArrayList();
        all.add( new Transfer.Builder(x)
            .setDescription(TrustAccount.find(x, txn.findSourceAccount(x)).getName()+" FX Transfer COMPLETED")
            .setAccount(TrustAccount.find(x, txn.findSourceAccount(x)).getId())
            .setAmount(txn.getAmount())
            .build());
        all.add( new Transfer.Builder(getX())
            .setDescription("Source FX transfer")
            .setAccount(txn.getSourceAccount())
            .setAmount(-txn.getAmount())
            .build());
        all.add( new Transfer.Builder(x)
            .setDescription(TrustAccount.find(x, txn.findDestinationAccount(x)).getName()+" FX Transfer COMPLETED")
            .setAccount(TrustAccount.find(x, txn.findDestinationAccount(x)).getId())
            .setAmount(-txn.getDestinationAmount())
            .build());
        all.add( new Transfer.Builder(getX())
            .setDescription("Destination FX transfer")
            .setAccount(txn.getDestinationAccount())
            .setAmount(txn.getDestinationAmount())
            .build());

        txn.add( (Transfer[]) all.toArray(new Transfer[0]) );
        txn.setStatus(TransactionStatus.COMPLETED);
        txn.setIsQuoted(true);
        return txn;
      `
    }
  ]
});
