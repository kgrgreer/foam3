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
    'foam.dao.DAO',

    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.fx.FXDirection',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.FeesFields',
    'net.nanopay.fx.FXTransaction',
    'net.nanopay.fx.CurrencyFXService',
  ],

  constants: [
    {
      type: 'String',
      name: 'NANOPAY_FX_SERVICE_NSPEC_ID',
      value: 'localFXService'
    }
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
        if ( null == fxQuote ) throw new RuntimeException("Unable to get FX Quotes.");

        FXTransaction fxTransaction = new FXTransaction.Builder(x).build();
        fxTransaction.copyFrom(request);
        fxTransaction.setFxExpiry(fxQuote.getExpiryTime());
        fxTransaction.setFxQuoteId(fxQuote.getExternalId());
        fxTransaction.setFxRate(fxQuote.getRate());
        fxTransaction.setFxSettlementAmount(fxQuote.getTargetAmount());
        FeesFields fees = new FeesFields.Builder(x).build();
        fees.setTotalFees(fxQuote.getFee());
        fees.setTotalFeesCurrency(fxQuote.getFeeCurrency());
        fxTransaction.setFxFees(fees);
        if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()) ) fxTransaction.setAccepted(true);

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
