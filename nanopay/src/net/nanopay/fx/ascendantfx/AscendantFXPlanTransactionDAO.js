/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXPlanTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',

    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.tx.PlanTransaction',
    'net.nanopay.tx.QuoteTransaction',
    'net.nanopay.tx.TransactionType'
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject'
        }
      ],
      javaReturns: 'foam.core.FObject',
      javaCode: `
    if ( ! ( obj instanceof QuoteTransaction ) ) {
      return super.put_(x, obj);
    }

    Logger logger = (Logger) x.get("logger");

    QuoteTransaction quote = (QuoteTransaction) obj;
    Transaction request = quote.getRequestTransaction();
    PlanTransaction plan = new PlanTransaction.Builder(x).build();

    // QuoteTransaction may or may not have accounts.
    //Account sourceAccount = quote.findSourceAccount(x);
    //Account destinationAccount = quote.findDestinationAccount(x);

    // TODO:
    // handle
    // CAD -> USD
    // USD -> USD
    // USD -> INR

    // Create and execute AscendantFXTransaction to get Rate
    // store in plan

    // Create AscendantFX CICO Transactions
    // Add nanopay Fee?

    if ( plan.getQueued().length > 0 ) {
      quote.add(x, plan);
    }

    return getDelegate().put_(x, quote);
    `
    },
  ]
});
