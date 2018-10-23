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
    'foam.nanos.notification.Notification',

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
    'net.nanopay.fx.FXQuote',
    'net.nanopay.iso20022.FIToFICustomerCreditTransferV06',
    'net.nanopay.iso20022.Pacs00800106',
    'net.nanopay.iso20022.PaymentIdentification3'

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
      String pacsEndToEndId = getPacs008EndToEndId(request);
      FXQuote fxQuote = new FXQuote.Builder(x).build();
      if ( ! SafetyUtil.isEmpty(pacsEndToEndId) )
        fxQuote = FXQuote.lookUpFXQuote(x, pacsEndToEndId, request.getPayerId());


      // FX Rate has not yet been fetched
      if ( fxQuote.getId() < 1 ) {
        try {
          fxQuote = fxService.getFXRate(request.getSourceCurrency(),
            request.getDestinationCurrency(), request.getAmount(), FXDirection.Buy.getName(), null, request.getPayerId(), null);
        } catch (Throwable t) {
          String message = "Unable to get FX quotes for source currency: "+ request.getSourceCurrency() + " and destination currency: " + request.getDestinationCurrency() + " from AscendantFX" ;
          Notification notification = new Notification.Builder(x)
            .setTemplate("NOC")
            .setBody(message)
            .build();
            ((DAO) x.get("notificationDAO")).put(notification);
            ((Logger) x.get("logger")).error("Error sending GetQuote to AscendantFX.", t);
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
  },
  {
    name: 'getPacs008EndToEndId',
    args: [
      {
        class: 'FObjectProperty',
        of: 'net.nanopay.tx.model.Transaction',
        name: 'transaction'
      }
    ],
    javaReturns: 'String',
    javaCode: `
    String pacsEndToEndId = null;
    if ( null != transaction.getReferenceData() && transaction.getReferenceData().length > 0 ) {
      if ( transaction.getReferenceData()[0] instanceof Pacs00800106 ) {
        Pacs00800106 pacs = (Pacs00800106) transaction.getReferenceData()[0];
        FIToFICustomerCreditTransferV06 fi = pacs.getFIToFICstmrCdtTrf();
        if ( null != fi && null != fi.getCreditTransferTransactionInformation() && fi.getCreditTransferTransactionInformation().length > 0 ) {
          PaymentIdentification3 pi = fi.getCreditTransferTransactionInformation()[0].getPaymentIdentification();
          pacsEndToEndId =  pi != null ? pi.getEndToEndIdentification() : null ;
        }
      }
    }
    return pacsEndToEndId;
      `
      }
  ]
});
