/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaTransactionPlanDAO',
  extends: 'net.nanopay.tx.cico.CABankTransactionPlanDAO',

  documentation: ``,

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.*',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.cico.VerificationTransaction',
  ],

   constants: [
    {
      name: 'PROVIDER_ID',
      type: 'String',
      value: 'Alterna'
    }
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
      
      if ( ! this.getEnabled() ) {
        return getDelegate().put_(x, obj);
      }
      
      TransactionQuote quote = (TransactionQuote) obj;
      Transaction request = quote.getRequestTransaction();
      Logger logger = (Logger) x.get("logger");
      
      if ( request instanceof AlternaVerificationTransaction ) {
        request.setIsQuoted(true);
        quote.addPlan(request);
        return quote;
      } else if ( request instanceof VerificationTransaction ) {
        return getDelegate().put_(x, obj);
      }
      
      Account sourceAccount = quote.getSourceAccount();
      Account destinationAccount = quote.getDestinationAccount();
      if ( sourceAccount instanceof CABankAccount &&
        destinationAccount instanceof DigitalAccount ) {
        
        if ( ! usePaymentProvider(x, PROVIDER_ID, (BankAccount) sourceAccount, false) ) return getDelegate().put_(x, obj);
        
        if ( ((CABankAccount) sourceAccount).getStatus() != BankAccountStatus.VERIFIED ) {
          logger.error("Bank account needs to be verified for cashin " + sourceAccount.getId());
          throw new RuntimeException("Bank account needs to be verified for cashin");
        }
        AlternaCITransaction t = new AlternaCITransaction.Builder(x).build();
        t.copyFrom(request);
        t.setTransfers(createCITransfers(x, t));
        // TODO: use EFT calculation process
        t.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()}, null);
        t.setIsQuoted(true);
        quote.addPlan(t);
      } else if ( sourceAccount instanceof DigitalAccount &&
                  destinationAccount instanceof CABankAccount &&
                  sourceAccount.getOwner() == destinationAccount.getOwner() ) {
      
        if ( ! usePaymentProvider(x, PROVIDER_ID, (BankAccount) destinationAccount, false) ) return getDelegate().put_(x, obj);

        if ( ((CABankAccount) destinationAccount).getStatus() != BankAccountStatus.VERIFIED ) {
          logger.error("Bank account needs to be verified for cashout");
          throw new RuntimeException("Bank account needs to be verified for cashout");
        }
        Transaction t = new AlternaCOTransaction.Builder(x).build();
        t.copyFrom(request);
        t.setTransfers(createCOTransfers(x, t));
        // TODO: use EFT calculation process
        t.addLineItems(new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()}, null);
        t.setIsQuoted(true);
        quote.addPlan(t);
      }
      return getDelegate().put_(x, quote);`
    }
  ]
});
