foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'GenericFXPlanDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `This Planner is for transactions from any currency to any different currency. It takes any FXTransaction type.`,

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
     'foam.util.SafetyUtil',
     'net.nanopay.account.Account',
     'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
     'net.nanopay.tx.model.Transaction',
     'net.nanopay.tx.TransactionQuote',
     'net.nanopay.tx.Transfer',
     'net.nanopay.tx.model.TransactionStatus',
     'java.util.ArrayList',
     'java.util.List'
  ],

  constants: [
    {
      name: 'PROVIDER_ID',
      type: 'String',
      value: 'Generic'
    }
  ],

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: false
    }
  ],

   methods: [
    {
      name: 'put_',
      javaCode: `
        if (getEnabled()) {
          TransactionQuote quote = (TransactionQuote) obj;
          Transaction txn = (Transaction) quote.getRequestTransaction();
          if ( ! SafetyUtil.equals(txn.getSourceCurrency(),txn.getDestinationCurrency()) ) {

            // has source and destination but no rate or has all 3.
            if ( ! SafetyUtil.equals(txn.getAmount(),0) && ! SafetyUtil.equals(txn.getDestinationAmount(),0) ) {
              quote.setPlan(buildFxTransaction_(x,txn));
              return quote;//super.put_(x,quote);
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
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.fx.FXTransaction',
      javaCode:`
        FXTransaction f = new FXTransaction();
        f.setDestinationCurrency(txn.getDestinationCurrency());
        f.setSourceCurrency(txn.getSourceCurrency());
        f.setAmount(txn.getAmount());
        f.setDestinationAmount(txn.getDestinationAmount());
        f.setSourceAccount(txn.getSourceAccount());
        f.setLastStatusChange(txn.getLastStatusChange());
        f.setDestinationAccount(txn.getDestinationAccount());
        f.setFxRate( Math.round(((double) txn.getAmount()/txn.getDestinationAmount())*10000) / 10000.0);
        List all = new ArrayList();
        TrustAccount sourceTrust = ((BankAccount)f.findSourceAccount(x)).findTrustAccount(x);
        all.add( new Transfer.Builder(x)
            .setDescription(sourceTrust.getName()+" FX Transfer COMPLETED")
            .setAccount(sourceTrust.getId())
            .setAmount(txn.getAmount())
            .build());
        all.add( new Transfer.Builder(getX())
            .setDescription("Source FX transfer")
            .setAccount(txn.getSourceAccount())
            .setAmount(-txn.getAmount())
            .build());

        TrustAccount destinationTrust = ((BankAccount)f.findDestinationAccount(x)).findTrustAccount(x);
        all.add( new Transfer.Builder(x)
            .setDescription(destinationTrust.getName()+" FX Transfer COMPLETED")
            .setAccount(destinationTrust.getId())
            .setAmount(-txn.getDestinationAmount())
            .build());
        all.add( new Transfer.Builder(getX())
            .setDescription("Destination FX transfer")
            .setAccount(txn.getDestinationAccount())
            .setAmount(txn.getDestinationAmount())
            .build());
        f.add( (Transfer[]) all.toArray(new Transfer[0]) );
        f.setStatus(TransactionStatus.COMPLETED);
        f.addLineItems(txn.getLineItems(),null);
        f.setIsQuoted(true);
        return f;
      `
    }
  ]
});
