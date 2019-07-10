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
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.cico.CITransaction'
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

    TransactionQuote quote = (TransactionQuote) obj;
    Transaction request = (Transaction) quote.getRequestTransaction().fclone();

    Account sourceAccount = request.findSourceAccount(x);
    Account destinationAccount = request.findDestinationAccount(x);

    if ( sourceAccount instanceof BankAccount &&
      destinationAccount instanceof DigitalAccount ) {

      CITransaction t = new CITransaction.Builder(x).build();
      t.copyFrom(request);
      t.setIsQuoted(true);
      quote.addPlan(t);

    }

    return getDelegate().put_(x, quote);
    `
    },
  ]
});
