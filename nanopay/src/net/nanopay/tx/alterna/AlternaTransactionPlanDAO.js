/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
  'net.nanopay.bank.BankAccountStatus',
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.mlang.sink.Count',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*',
    'foam.dao.DAO'
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
      javaCode: `TransactionQuote quote = (TransactionQuote) obj;
      Transaction request = quote.getRequestTransaction();
      Logger logger = (Logger) x.get("logger");
      if ( request instanceof AlternaVerificationTransaction ) {
        request.setIsQuoted(true);
        quote.addPlan(request);
        return quote;
      }
      Account sourceAccount = quote.getSourceAccount();
      Account destinationAccount = quote.getDestinationAccount();
      if ( sourceAccount instanceof CABankAccount &&
        destinationAccount instanceof DigitalAccount ) {
        if ( ((CABankAccount) sourceAccount).getStatus() != BankAccountStatus.VERIFIED ) {
          logger.error("Bank account needs to be verified for cashin " + sourceAccount.getId());
          throw new RuntimeException("Bank account needs to be verified for cashin");
        }
        AlternaCITransaction t = new AlternaCITransaction.Builder(x).build();
        t.copyFrom(request);
        // TODO: use EFT calculation process
        t.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()}, null);
        t.setIsQuoted(true);
        quote.addPlan(t);
      } else if ( destinationAccount instanceof CABankAccount &&
        sourceAccount instanceof DigitalAccount ) {
        if ( ((CABankAccount) destinationAccount).getStatus() != BankAccountStatus.VERIFIED ) {
          logger.error("Bank account needs to be verified for cashout");
          throw new RuntimeException("Bank account needs to be verified for cashout " + destinationAccount.getId());
        }
        AlternaCOTransaction t = new AlternaCOTransaction.Builder(x).build();
        t.copyFrom(request);
        // TODO: use EFT calculation process
        t.addLineItems(new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()}, null);
        t.setIsQuoted(true);
        quote.addPlan(t);
      }
      return getDelegate().put_(x, quote);`
    },
  ]
});
