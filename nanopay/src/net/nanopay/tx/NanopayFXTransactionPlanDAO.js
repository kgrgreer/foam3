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
    'foam.nanos.logger.Logger',

    'net.nanopay.account.Account',
    'net.nanopay.tx.TransactionPlan',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.FeeTransfer',
    'net.nanopay.tx.Transfer',
    'foam.dao.DAO',

    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.fx.FXDirection',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.FeesFields',
    'net.nanopay.fx.FXTransaction',
    'net.nanopay.fx.CurrencyFXService',
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
      type: 'long',
      name: 'NANOPAY_FEE_ACCOUNT_ID',
      value: 2
    },
    {
      type: 'long',
      name: 'NANOPAY_BROKER_ID',
      value: 1
    },
  ],

  properties: [
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
      if ( !(obj instanceof TransactionQuote) ) {
        return getDelegate().put_(x, obj);
      }

      Logger logger = (Logger) x.get("logger");
      TransactionQuote quote = (TransactionQuote) obj;
      Transaction request = quote.getRequestTransaction();
      TransactionPlan plan = new TransactionPlan.Builder(x).build();

      logger.debug(this.getClass().getSimpleName(), "put", quote);

      Account sourceAccount = request.findSourceAccount(x);
      Account destinationAccount = request.findDestinationAccount(x);

      // Check if NanoPayFXTransactionPlanDAO can handle the currency combination
      FXService fxService = CurrencyFXService.getFXServiceByNSpecId(x, request.getSourceCurrency(),
          request.getDestinationCurrency(), NANOPAY_FX_SERVICE_NSPEC_ID);
      if ( null != fxService ) {

        // Get Rates
        FXQuote fxQuote = fxService.getFXRate(sourceAccount.getDenomination(), destinationAccount.getDenomination(),
            request.getAmount(), FXDirection.Buy.getName(), null, sourceAccount.getOwner(), null);
        if ( null == fxQuote ) return getDelegate().put_(x, obj);

        Broker broker = (Broker) ((DAO) getX().get("brokerDAO")).find_(x, NANOPAY_BROKER_ID);
        User brokerUser = (User) ((DAO) getX().get("localUserDAO")).find_(x, broker.getUserId());
        Account brokerSourceAccount = DigitalAccount.findDefault(x, brokerUser, sourceAccount.getDenomination());
        Account brokerDestinationAccount = DigitalAccount.findDefault(x, brokerUser, destinationAccount.getDenomination());

        FXTransaction fxTransaction = new FXTransaction.Builder(x).build();
        fxTransaction.copyFrom(request);
        fxTransaction.setFxExpiry(fxQuote.getExpiryTime());
        fxTransaction.setFxQuoteId(fxQuote.getExternalId());
        fxTransaction.setFxRate(fxQuote.getRate());
        fxTransaction.setDestinationAmount((new Double(fxQuote.getTargetAmount())).longValue());
        if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()) ) fxTransaction.setAccepted(true);

        Transfer[] transfers = new Transfer [] {
          new Transfer.Builder(x).setAccount(sourceAccount.getId()).setAmount(-request.getTotal()).build(),
          new Transfer.Builder(x).setAccount(brokerSourceAccount.getId()).setAmount(request.getTotal()).build(),
          new Transfer.Builder(x).setAccount(brokerDestinationAccount.getId()).setAmount(-fxTransaction.getDestinationAmount()).build(),
          new Transfer.Builder(x).setAccount(destinationAccount.getId()).setAmount(fxTransaction.getDestinationAmount()).build()
        };
        fxTransaction.add(transfers);

        if ( fxQuote.getFee() > 0 ) {
          Long feeAmount = (new Double(fxQuote.getFee())).longValue();
          FeeTransfer[] tr = new FeeTransfer [] {
            new FeeTransfer.Builder(x).setDescription("FX Broker Fee")
                .setAccount(request.getSourceAccount())
                .setAmount(-(feeAmount)).build(),
            new FeeTransfer.Builder(x).setDescription("FX Broker Fee")
                .setAccount(NANOPAY_FEE_ACCOUNT_ID)
                .setAmount(feeAmount).build()
          };
          fxTransaction.add(tr);
        }

        plan.setTransaction(fxTransaction);

      }

      if ( plan.getTransaction() != null ) {
        quote.addPlan(plan);
      }

      return super.put_(x, quote);
    `
    },
  ]
});
