/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',

    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.*',
    'foam.dao.DAO',
    'net.nanopay.tx.KotakCOTransaction',
  ],

  properties: [
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      if ( !(obj instanceof TransactionQuote) ) {
           return getDelegate().put_(x, obj);
         }

         Logger logger = (Logger) x.get("logger");
         TransactionQuote quote = (TransactionQuote) obj;
         Transaction request = quote.getRequestTransaction();

         logger.debug(this.getClass().getSimpleName(), "put", quote);

         Account sourceAccount = request.findSourceAccount(x);
         Account destinationAccount = request.findDestinationAccount(x);

         if ( sourceAccount instanceof DigitalAccount
             && destinationAccount instanceof INBankAccount ) {

           if ( destinationAccount.getDenomination().equalsIgnoreCase(sourceAccount.getDenomination()) ) {
             KotakCOTransaction kotakCOTransaction = new KotakCOTransaction.Builder(x).build();
             kotakCOTransaction.copyFrom(request);
             kotakCOTransaction.setIsQuoted(true);

             quote.addPlan(kotakCOTransaction);
           }
         }

         return super.put_(x, quote);
    `
    },
  ]
});
