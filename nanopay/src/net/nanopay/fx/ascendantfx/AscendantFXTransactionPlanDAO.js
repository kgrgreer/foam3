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
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.dao.AbstractSink',
    'foam.core.Detachable',
    'foam.util.SafetyUtil',

    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.fx.FXTransaction',
    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.tx.ErrorTransaction',
    'net.nanopay.tx.TransactionPlan',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.fx.FXDirection',
    'net.nanopay.fx.FeesFields',
    'net.nanopay.fx.ascendantfx.model.Deal',
    'net.nanopay.fx.ascendantfx.model.Direction',
    'net.nanopay.fx.ascendantfx.model.GetQuoteRequest',
    'net.nanopay.fx.ascendantfx.model.GetQuoteResult',
    'net.nanopay.fx.ascendantfx.model.Quote',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.CurrencyFXService',
    'net.nanopay.fx.FXQuote'

  ],

  constants: [
    {
      type: 'String',
      name: 'ASCENDANTFX_SERVICE_NSPEC_ID',
      value: 'ascendantFXService'
    }
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

    // Create and execute AscendantFXTransaction to get Rate
    // store in plan

    // Check if AscendantFXTransactionPlanDAO can handle the currency combination
    FXService fxService = CurrencyFXService.getFXServiceByNSpecId(x, request.getSourceCurrency(),
      request.getDestinationCurrency(), ASCENDANTFX_SERVICE_NSPEC_ID);
    if ( null != fxService ) {

      // TODO: test if fx already done
      FXQuote fxQuote = new FXQuote.Builder(x).build();
      if ( ! SafetyUtil.isEmpty(request.getPacs008EndToEndId()) )
        fxQuote = FXQuote.lookUpFXQuote(x, request.getPacs008EndToEndId(), request.getPayerId());


      // FX Rate has not yet been fetched
      if ( fxQuote.getId() < 1 ) {
        try {
          fxQuote = fxService.getFXRate(request.getSourceCurrency(),
            request.getDestinationCurrency(), request.getAmount(), FXDirection.Buy.getName(), null, request.getPayerId(), null);
        }catch (Throwable t) {
          ((Logger) x.get("logger")).error("Error sending GetQuote to AscendantFX.", t);
          plan.setTransaction(new ErrorTransaction.Builder(x).setErrorMessage("AscendantFX failed to acquire quote: " + t.getMessage()).setException(t).build());
        }
      }


      if ( fxQuote.getId() > 0 ) {
        AscendantFXTransaction ascendantFXTransaction = new AscendantFXTransaction.Builder(x).build();
        ascendantFXTransaction.copyFrom(request);
        ascendantFXTransaction.setFxExpiry(fxQuote.getExpiryTime());
        ascendantFXTransaction.setFxQuoteId(String.valueOf(fxQuote.getId()));
        ascendantFXTransaction.setFxRate(fxQuote.getRate());
        ascendantFXTransaction.setFxSettlementAmount(fxQuote.getTargetAmount());
        FeesFields fees = new FeesFields.Builder(x).build();
        fees.setTotalFees(fxQuote.getFee());
        fees.setTotalFeesCurrency(fxQuote.getFeeCurrency());
        ascendantFXTransaction.setFxFees(fees);
        ascendantFXTransaction.setIsQuoted(true);
        if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()))
          ascendantFXTransaction.setAccepted(true);

        plan.setTransaction(ascendantFXTransaction);
      }


    if ( plan.getTransaction() != null ) {
      quote.addPlan(plan);
    }

    }

    return getDelegate().put_(x, quote);
    `
    }
  ]
});
