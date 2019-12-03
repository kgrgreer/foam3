/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'GenericCIPlanner',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'foam.nanos.app.Mode',
    'foam.nanos.app.AppConfig',
    'java.util.List',
    'java.util.ArrayList',
    'net.nanopay.tx.Transfer',

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

    TransactionQuote quote = (TransactionQuote) obj;

    if ( ((AppConfig) x.get("appConfig")).getMode() == Mode.PRODUCTION  || getEnabled() == false )
      return getDelegate().put_(x, quote);

    Transaction request = (Transaction) quote.getRequestTransaction().fclone();

    Account sourceAccount = request.findSourceAccount(x);
    Account destinationAccount = request.findDestinationAccount(x);

    if ( sourceAccount instanceof BankAccount &&
      destinationAccount instanceof DigitalAccount ) {

      CITransaction t = new CITransaction.Builder(x).build();
      t.copyFrom(request);
      TrustAccount trustAccount = TrustAccount.find(getX(),sourceAccount);
      List all = new ArrayList();
      all.add(new Transfer.Builder(x)
          .setDescription(trustAccount.getName()+" Cash-In")
          .setAccount(trustAccount.getId())
          .setAmount(-t.getTotal())
          .build());
      all.add(new Transfer.Builder(x)
          .setDescription("Cash-In")
          .setAccount(destinationAccount.getId())
          .setAmount(t.getTotal())
          .build());
      t.setTransfers((Transfer[]) all.toArray(new Transfer[0]));
      t.setIsQuoted(true);
      t.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);
      quote.setPlan(t);
      return quote;

    }
    if ( destinationAccount instanceof BankAccount &&
       sourceAccount instanceof DigitalAccount ) {

      COTransaction t = new COTransaction.Builder(x).build();
      t.copyFrom(request);

      TrustAccount trustAccount = TrustAccount.find(getX(),destinationAccount);
      List all = new ArrayList();
      all.add(new Transfer.Builder(x)
        .setDescription(trustAccount.getName()+" Cash-Out")
        .setAccount(trustAccount.getId())
        .setAmount(t.getTotal())
        .build());
      all.add( new Transfer.Builder(x)
        .setDescription("Cash-Out")
        .setAccount(sourceAccount.getId())
        .setAmount(-t.getTotal())
        .build());
      t.setTransfers((Transfer[]) all.toArray(new Transfer[0]));
      t.setIsQuoted(true);
      t.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);
      quote.setPlan(t);
      return quote;
    }
    return getDelegate().put_(x, quote);
    `
    }
  ]
});
