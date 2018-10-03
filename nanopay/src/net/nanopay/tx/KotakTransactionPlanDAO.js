/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',

    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.INBankAccount',
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
    'net.nanopay.tx.KotakTransaction'
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
      if (!(obj instanceof TransactionQuote)) {
        return getDelegate().put_(x, obj);
      }

      Logger logger = (Logger) x.get("logger");
      TransactionQuote quote = (TransactionQuote) obj;
      Transaction request = quote.getRequestTransaction();
      TransactionPlan plan = new TransactionPlan.Builder(x).build();

      logger.debug(this.getClass().getSimpleName(), "put", quote);

      Account sourceAccount = request.findSourceAccount(x);
      Account destinationAccount = request.findDestinationAccount(x);

      if (sourceAccount instanceof DigitalAccount
          && destinationAccount instanceof INBankAccount) {

        // Get Rates
        FXService fxService = (FXService) x.get("localFXService");
        FXQuote fxQuote = fxService.getFXRate(sourceAccount.getDenomination(), destinationAccount.getDenomination(),
            request.getAmount(), FXDirection.Buy.getName(), null, sourceAccount.getOwner());
        if ( null == fxQuote ) throw new RuntimeException("Unable to get FX Quotes.");

        KotakTransaction kotakTransaction = new KotakTransaction.Builder(x).build();
        kotakTransaction.copyFrom(request);
        kotakTransaction.setFxExpiry(fxQuote.getExpiryTime());
        kotakTransaction.setFxQuoteId(fxQuote.getExternalId());
        kotakTransaction.setFxRate(fxQuote.getRate());
        kotakTransaction.setFxSettlementAmount(fxQuote.getTargetAmount());
        FeesFields fees = new FeesFields.Builder(x).build();
        fees.setTotalFees(fxQuote.getFee());
        fees.setTotalFeesCurrency(fxQuote.getFeeCurrency());
        kotakTransaction.setFxFees(fees);
        if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()))
          kotakTransaction.setAccepted(true);

        plan.setTransaction(kotakTransaction);

      }

      if (plan.getTransaction() != null) {
        quote.addPlan(plan);
      }

      return super.put_(x, quote);
    `
    },
  ]
});
