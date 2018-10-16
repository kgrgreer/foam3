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
    'foam.util.SafetyUtil',

    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.tx.TransactionPlan',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'foam.dao.DAO',
    'net.nanopay.tx.KotakCOTransaction',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.FXDirection',
    'net.nanopay.fx.FXProvider',
    'net.nanopay.fx.KotakFXProvider'
  ],

  constants: [
    {
      type: 'long',
      name: 'NANOPAY_CAD_DIGITAL_ACCOUNT_ID',
      value: 3
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
      User payeeUser = (User) ((DAO) getX().get("localUserDAO")).find_(x, request.getPayeeId());
      Account payeeINRDigitalAccount = DigitalAccount.findDefault(x, payeeUser, "INR");

      if ( sourceAccount instanceof DigitalAccount
          && destinationAccount instanceof INBankAccount ) {


        // Get Kotak FX Rate
        FXService fxService = (FXService) x.get("localFXService");
        // test if fx already done
        FXQuote fxQuote = new FXQuote.Builder(x).build();
        if ( ! SafetyUtil.isEmpty(request.getPacs008EndToEndId()) )
          fxQuote = FXQuote.lookUpFXQuote(x, request.getPacs008EndToEndId(), request.getPayerId());

          // FX Rate has not yet been fetched
          if ( fxQuote.getId() < 1 ) {
            FXProvider kotakFXProvider = new KotakFXProvider.Builder(x).build();
            fxQuote = fxService.getFXRate(request.getSourceCurrency(), request.getDestinationCurrency(),
              request.getAmount(), FXDirection.Buy.getName(), null, request.getPayerId(), kotakFXProvider.getId());
          }

          // REVIEW: if unable to get FX rate....
        if ( fxQuote.getId() > 0 ) {
          KotakCOTransaction kotakCOTransaction = new KotakCOTransaction.Builder(x).build();
          kotakCOTransaction.copyFrom(request);
          kotakCOTransaction.setIsQuoted(true);
          kotakCOTransaction.setFxRate(fxQuote.getRate());
          kotakCOTransaction.setSourceAccount(payeeINRDigitalAccount.getId());
          kotakCOTransaction.setAmount((new Double(fxQuote.getTargetAmount())).longValue());

          Transfer[] transfers = new Transfer[]{
            new Transfer.Builder(x).setDescription("Debit Broker INR Digital Account")
              .setAccount(NANOPAY_CAD_DIGITAL_ACCOUNT_ID)
              .setAmount(-(kotakCOTransaction.getTotal()))
              .build(),
            new Transfer.Builder(x).setDescription("Credit Payee INR Digital Account")
              .setAccount(kotakCOTransaction.getSourceAccount())
              .setAmount(kotakCOTransaction.getTotal())
              .build()
          };

          kotakCOTransaction.add(transfers);
          plan.setTransaction(kotakCOTransaction);
          quote.addPlan(plan);

        }

      }

      return super.put_(x, quote);
    `
    },
  ]
});
