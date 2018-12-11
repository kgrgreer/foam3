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
      javaCode: `
    Logger logger = (Logger) x.get("logger");

    TransactionQuote quote = (TransactionQuote) obj;
    Transaction request = (Transaction) quote.getRequestTransaction().fclone();

    logger.debug(this.getClass().getSimpleName(), "put", quote);

    // RequestTransaction may or may not have accounts.
    Account sourceAccount = request.findSourceAccount(x);
    Account destinationAccount = request.findDestinationAccount(x);

    logger.debug(this.getClass().getSimpleName(), "put", "sourceAccount", sourceAccount, "destinationAccount", destinationAccount);

    if ( sourceAccount instanceof CABankAccount &&
      destinationAccount instanceof DigitalAccount ) {
       long count = ((Count) ((DAO) x.get("localTransactionDAO")).where(
          AND(
                             INSTANCE_OF(AlternaVerificationTransaction.getOwnClassInfo()),
                             EQ(Transaction.SOURCE_ACCOUNT, sourceAccount.getId()),
                             OR(
                               EQ(Transaction.DESTINATION_ACCOUNT, sourceAccount.getId()),
                               EQ(Transaction.SOURCE_ACCOUNT, sourceAccount.getId())
                             )
                           )).select(new Count())).getValue();
           if ( count == 0 && ((CABankAccount) sourceAccount).getStatus() == BankAccountStatus.UNVERIFIED) {
             AlternaVerificationTransaction v = new AlternaVerificationTransaction.Builder(x).build();
             v.copyFrom(request);
             v.setIsQuoted(true);
             quote.addPlan(v);
             return super.put_(x, quote);
           }
      AlternaCITransaction t = new AlternaCITransaction.Builder(x).build();
      t.copyFrom(request);

      // TODO: use EFT calculation process
      t.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()}, null);
      t.setIsQuoted(true);
      quote.addPlan(t);
    } else if ( destinationAccount instanceof CABankAccount &&
      sourceAccount instanceof DigitalAccount ) {
      AlternaCOTransaction t = new AlternaCOTransaction.Builder(x).build();
      t.copyFrom(request);

      // TODO: use EFT calculation process
      t.addLineItems(new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()}, null);
      t.setIsQuoted(true);
      quote.addPlan(t);
    }

    return getDelegate().put_(x, quote);
    `
    },
  ]
});
