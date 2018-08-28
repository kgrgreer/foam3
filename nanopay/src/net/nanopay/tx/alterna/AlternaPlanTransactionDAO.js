/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaPlanTransactionDAO',
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
    'net.nanopay.tx.model.Transaction',
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

    // RequestTransaction may or may not have accounts.
    Account sourceAccount = request.findSourceAccount(x);
    Account destinationAccount = request.findDestinationAccount(x);
    if ( sourceAccount instanceof CABankAccount &&
      destinationAccount instanceof DigitalAccount ) {
      AlternaCITransaction t = new AlternaCITransaction.Builder(x).build();
      t.copyFrom(request);
      if ( sourceAccount.getOwner() != destinationAccount.getOwner() ) {
        t.setType(TransactionType.BANK_ACCOUNT_PAYMENT);
      } else {
        t.setType(TransactionType.CASHIN);
      }
      plan.add(x, t);
    } else if ( destinationAccount instanceof CABankAccount &&
      sourceAccount instanceof DigitalAccount ) {
      AlternaCOTransaction t = new AlternaCOTransaction.Builder(x).build();
      t.copyFrom(request);
      t.setType(TransactionType.CASHOUT);
      plan.add(x, t);
    } else if ( sourceAccount instanceof CABankAccount &&
         destinationAccount instanceof CABankAccount ) {
      // Canadian Bank to Bank
      User sourceUser = sourceAccount.findOwner(x);
      User destinationUser = destinationAccount.findOwner(x);
      DigitalAccount destinationDigital = DigitalAccount.findDefault(x, destinationUser, "CAD");

      AlternaTransaction ci = new AlternaTransaction.Builder(x).build();
      ci.copyFrom(request);
      ci.setDestinationAccount(destinationDigital.getId());
      ci.setPayeeId(destinationUser.getId());
      ci.setType(TransactionType.CASHIN);
      plan.add(x, ci);

      AlternaTransaction co = new AlternaTransaction.Builder(x).build();
      co.copyFrom(request);
      co.setSourceAccount(destinationDigital.getId());
      co.setPayerId(destinationUser.getId());
      co.setType(TransactionType.CASHOUT);
      plan.add(x, co);
    // } else if ( request.getCurrency() != null &&
    //   request.getDestCurrency() != null &&
    //   request.getCurrency().getAlphabeticCode() == 'CA' &&
    //   request.getDestCurrency().getAlphabeticCode() == 'CA') {
    }

    // TODO: add nanopay fee

    if ( plan.getQueued().length > 0 ) {
      quote.add(x, plan);
    }

    return getDelegate().put_(x, quote);
    `
    },
  ]
});
