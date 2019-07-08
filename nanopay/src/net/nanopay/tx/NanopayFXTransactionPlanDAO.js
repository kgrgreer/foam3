/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'NanopayFXTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
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

  properties: [
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `TransactionQuote quote = (TransactionQuote) obj;
      Transaction request = quote.getRequestTransaction();
      if (SafetyUtil.equals(request.getSourceCurrency(), request.getDestinationCurrency())) return getDelegate().put_(x, obj);
      Account sourceAccount = quote.getSourceAccount();
      Account destinationAccount = quote.getDestinationAccount();
      if ( ! (sourceAccount instanceof DigitalAccount) || ! (destinationAccount instanceof DigitalAccount) ) return getDelegate().put_(x, obj);
      // Check if NanoPayFXTransactionPlanDAO can handle the currency combination
      FXService fxService = CurrencyFXService.getFXServiceByNSpecId(x, request.getSourceCurrency(),
          request.getDestinationCurrency(), NANOPAY_FX_SERVICE_NSPEC_ID);
      if ( null != fxService ) {

        // Get Rates
        FXQuote fxQuote = fxService.getFXRate(sourceAccount.getDenomination(), destinationAccount.getDenomination(),
            request.getAmount(), request.getDestinationAmount(), FXDirection.Buy.getName(), null, sourceAccount.getOwner(), null);
        if ( null == fxQuote ) return getDelegate().put_(x, obj);

        Broker broker = (Broker) ((DAO) getX().get("brokerDAO")).find_(x, NANOPAY_BROKER_ID);
        User brokerUser = (User) ((DAO) getX().get("localUserDAO")).find_(x, broker.getUserId());
        Account brokerSourceAccount = DigitalAccount.findDefault(getX(), brokerUser, sourceAccount.getDenomination());
        Account brokerDestinationAccount = DigitalAccount.findDefault(getX(), brokerUser, destinationAccount.getDenomination());

        FXTransaction fxTransaction = new FXTransaction.Builder(x).build();

        fxTransaction.copyFrom(request);
        //fxTransaction.setStatus(TransactionStatus.COMPLETED); // act like digital
        fxTransaction.setFxExpiry(fxQuote.getExpiryTime());
        fxTransaction.setFxQuoteId(fxQuote.getExternalId());
        fxTransaction.setFxRate(fxQuote.getRate());
        fxTransaction.setDestinationAmount((new Double(fxQuote.getTargetAmount())).longValue());
        fxTransaction.addLineItems(new TransactionLineItem[] {new FXLineItem.Builder(x).setGroup("fx").setRate(fxQuote.getRate()).setQuoteId(fxQuote.getExternalId()).setExpiry(fxQuote.getExpiryTime()).setAccepted(ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus())).build()}, null);
        if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()) ) {
          //TODO/REVIEW - where does this go now?
          fxTransaction.setAccepted(true);
        }

        Transfer[] transfers = new Transfer [] {
          new Transfer.Builder(x).setAccount(sourceAccount.getId()).setAmount(-request.getTotal()).build(),
          new Transfer.Builder(x).setAccount(brokerSourceAccount.getId()).setAmount(request.getTotal()).build(),

          new Transfer.Builder(x).setAccount(brokerDestinationAccount.getId()).setAmount(-fxTransaction.getDestinationAmount()).build(),
          new Transfer.Builder(x).setAccount(destinationAccount.getId()).setAmount(fxTransaction.getDestinationAmount()).build()
        };
        fxTransaction.add(transfers);

        if ( fxQuote.getFee() > 0 ) {
          Long feeAmount = (new Double(fxQuote.getFee())).longValue();
          fxTransaction.addLineItems(new TransactionLineItem[] {new FeeLineItem.Builder(x).setGroup("fx").setNote("FX Broker Fee").setAmount(feeAmount).setDestinationAccount(NANOPAY_FEE_ACCOUNT_ID).build()}, null);
        }
        fxTransaction.setIsQuoted(true);
        quote.addPlan(fxTransaction);
      }

      return super.put_(x, quote);`
    },
  ]
});
