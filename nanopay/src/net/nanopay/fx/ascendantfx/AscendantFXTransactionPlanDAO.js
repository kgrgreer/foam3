/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',

    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.fx.FXTransaction',
    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.tx.ErrorTransaction',
    'net.nanopay.tx.alterna.AlternaCOTransaction',
    'net.nanopay.tx.TransactionPlan',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionType',
    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.fx.FXDirection',
    'net.nanopay.fx.FeesFields',
    'net.nanopay.fx.ascendantfx.model.Deal',
    'net.nanopay.fx.ascendantfx.model.Direction',
    'net.nanopay.fx.ascendantfx.model.GetQuoteRequest',
    'net.nanopay.fx.ascendantfx.model.GetQuoteResult',
    'net.nanopay.fx.ascendantfx.model.Quote',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.ExchangeRateQuote'

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
    if ( ! ( obj instanceof TransactionQuote ) ) {
      return super.put_(x, obj);
    }

    Logger logger = (Logger) x.get("logger");

    TransactionQuote quote = (TransactionQuote) obj;
    Transaction request = quote.getRequestTransaction();
    TransactionPlan plan = new TransactionPlan.Builder(x).build();
    FeesFields fxFees = new FeesFields.Builder(x).build();

    Account sourceAccount = request.findSourceAccount(x);
    Account destinationAccount = request.findDestinationAccount(x);

    // TODO:
    // This type of configuration should be associated with Corridoors (I think).
    // handle
    // CAD -> USD
    // USD -> USD
    // USD -> INR

    // Create and execute AscendantFXTransaction to get Rate
    // store in plan

    if ( sourceAccount instanceof CABankAccount &&
         destinationAccount instanceof USBankAccount ||
         sourceAccount instanceof USBankAccount &&
         destinationAccount instanceof USBankAccount ||
         sourceAccount instanceof USBankAccount &&
         destinationAccount instanceof INBankAccount ) {


    //Get ascendant service
    FXService fxService = (FXService) x.get("ascendantFXService");

    // TODO: test if fx already done
    try {

      ExchangeRateQuote qoute = fxService.getFXRate(request.getSourceCurrency(),
          destinationAccount.getDenomination(), request.getAmount(), FXDirection.Buy.getName(), null);

      if ( null != qoute ) {
        AscendantFXTransfer ascFXTransfer = new AscendantFXTransfer.Builder(x).build();
        ascFXTransfer.setFxQuoteId(qoute.getId());
        ascFXTransfer.setFxRate(qoute.getExchangeRate().getRate());
        ascFXTransfer.setFxExpiry(qoute.getExchangeRate().getExpirationTime());

        plan.setTransaction(ascFXTransfer); // REVEIW

      }
    } catch (Throwable t) {
      ((Logger) x.get("logger")).error("Error sending GetQuote to AscendantFX.", t);
      plan.setTransaction(new ErrorTransaction.Builder(x).setErrorMessage("AscendantFX failed to acquire quote: " + t.getMessage()).setException(t).build());
    }

    // Create AscendantFX CICO Transactions
    if( null != sourceAccount ){

      // Debit Source Account of Transaction amount
      AscendantFXCOTransaction coTransaction = new AscendantFXCOTransaction.Builder(x).build();
      coTransaction.copyFrom(request);
      plan.setTransaction(coTransaction);

      // Debit Source Account of Broker Fee.


    }


    // Add nanopay Fee?

    if ( plan != null ) {
      quote.getPlans()[quote.getPlans().length] = plan;
    }

    }

    return getDelegate().put_(x, quote);
    `
    },
  ]
});
