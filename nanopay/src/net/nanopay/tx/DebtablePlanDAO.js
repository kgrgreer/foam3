/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DebtablePlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.Debtable',
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Logger logger = (Logger) x.get("logger");
      TransactionQuote quote = (TransactionQuote) obj;
      Transaction request = quote.getRequestTransaction();

      logger.debug(this.getClass().getSimpleName(), "put", quote);

      Account sourceAccount = request.findSourceAccount(x);
      Account destinationAccount = request.findDestinationAccount(x);

      if ( sourceAccount instanceof Debtable ) {
        Account creditor = ((Debtable) sourceAccount).getCreditorAccount();
        Transaction d = new DebtTransaction.Builder(x)
          .setSourceAccount(creditorAccount)
          .setDestinationAccount(sourceAccount)
          .build();
        d.setNext(request);
        quote.setRequestTransaction(d);
      }
      `
    }
  ]
});
