/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'NanopayFXTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `Planner for nanopay FX transactions`,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'foam.dao.DAO',
    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.fx.FXDirection',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.FXTransaction',
    'net.nanopay.fx.CurrencyFXService',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.model.Broker',
    'net.nanopay.account.DigitalAccount',
  ],


  constants: [
    {
      type: 'String',
      name: 'NANOPAY_FX_SERVICE_NSPEC_ID',
      value: 'localFXService'
    },
    {
      type: 'Long',
      name: 'NANOPAY_FEE_ACCOUNT_ID',
      value: 2
    },
    {
      type: 'Long',
      name: 'NANOPAY_BROKER_ID',
      value: 1
    },
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
      //src and dest currency are different
      Account sourceAccount = quote.getSourceAccount();
      Account destinationAccount = quote.getDestinationAccount();
      // Check if NanoPayFXTransactionPlanner can handle the currency combination
      FXService fxService = CurrencyFXService.getFXServiceByNSpecId(x, requestTxn.getSourceCurrency(),
        requestTxn.getDestinationCurrency(), NANOPAY_FX_SERVICE_NSPEC_ID);
      if ( null != fxService ) {

        // Get Rates
        FXQuote fxQuote = fxService.getFXRate(sourceAccount.getDenomination(), destinationAccount.getDenomination(),
          requestTxn.getAmount(), requestTxn.getDestinationAmount(), FXDirection.BUY.getName(), null, sourceAccount.getOwner(), null);
        if ( null == fxQuote ) return null;

        Broker broker = (Broker) ((DAO) x.get("brokerDAO")).find_(x, NANOPAY_BROKER_ID);
        User brokerUser = (User) ((DAO) x.get("localUserDAO")).find_(x, broker.getUserId());
        Account brokerSourceAccount = DigitalAccount.findDefault(x, brokerUser, sourceAccount.getDenomination());
        Account brokerDestinationAccount = DigitalAccount.findDefault(x, brokerUser, destinationAccount.getDenomination());

        FXTransaction fxTransaction = new FXTransaction.Builder(x).build();

        fxTransaction.copyFrom(requestTxn);
        //fxTransaction.setStatus(TransactionStatus.COMPLETED); // act like digital
        fxTransaction.setFxExpiry(fxQuote.getExpiryTime());
        fxTransaction.setFxQuoteId(fxQuote.getExternalId());
        fxTransaction.setFxRate(fxQuote.getRate());
        fxTransaction.setDestinationAmount((new Double(fxQuote.getTargetAmount())).longValue());
        fxTransaction.addLineItems(new TransactionLineItem[] {new FXLineItem.Builder(x).setGroup("fx").setRate(fxQuote.getRate()).setQuoteId(fxQuote.getExternalId()).setExpiry(fxQuote.getExpiryTime()).setAccepted(ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus())).build()}, null);
        if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()) ) {
          fxTransaction.setAccepted(true);
        }

        quote.addTransfer(sourceAccount.getId(), -requestTxn.getTotal());
        quote.addTransfer(brokerSourceAccount.getId(), requestTxn.getTotal());
        quote.addTransfer(brokerDestinationAccount.getId(), -fxTransaction.getDestinationAmount());
        quote.addTransfer(destinationAccount.getId(), fxTransaction.getDestinationAmount());

        if ( fxQuote.getFee() > 0 ) {
          Long feeAmount = (new Double(fxQuote.getFee())).longValue();
          fxTransaction.addLineItems(new TransactionLineItem[] {new FeeLineItem.Builder(x).setGroup("fx").setNote("FX Broker Fee").setAmount(feeAmount).setDestinationAccount(NANOPAY_FEE_ACCOUNT_ID).build()}, null);
        }
        fxTransaction.setIsQuoted(true);
        return fxTransaction;
      }

      return null;
      `
    },
  ]
});
