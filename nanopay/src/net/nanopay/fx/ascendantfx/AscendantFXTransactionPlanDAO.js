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
             destinationAccount.getDenomination(), request.getAmount(), FXDirection.Buy.getName(), null, request.getPayerId());

             if ( null != qoute && null != qoute.getExchangeRate() ) {
               long targetAmount = (long) (qoute.getExchangeRate().getRate() * request.getAmount()); // Review: Why long, decimal part should be dropped or rounded?

               AscendantFXTransaction ascendantFXTransaction = new AscendantFXTransaction.Builder(x).build();
               ascendantFXTransaction.copyFrom(request);
               ascendantFXTransaction.setFxExpiry(qoute.getExchangeRate().getExpirationTime());
               ascendantFXTransaction.setFxQuoteId(qoute.getId());
               ascendantFXTransaction.setFxRate(qoute.getExchangeRate().getRate());
               ascendantFXTransaction.setFxFees(qoute.getFee());

               // Add nanopay Fee?


      }
    } catch (Throwable t) {
      ((Logger) x.get("logger")).error("Error sending GetQuote to AscendantFX.", t);
      plan.setTransaction(new ErrorTransaction.Builder(x).setErrorMessage("AscendantFX failed to acquire quote: " + t.getMessage()).setException(t).build());
    }



    if ( plan != null ) {
      quote.addPlan(plan);
    }

    }

    return getDelegate().put_(x, quote);
    `
    },
  ]
});
