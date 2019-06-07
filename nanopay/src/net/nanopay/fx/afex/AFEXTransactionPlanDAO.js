foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'foam.core.FObject',
    'foam.nanos.notification.Notification',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.fx.CurrencyFXService',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.tx.ExpiryLineItem',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.fx.FeesFields',
    'net.nanopay.fx.FXDirection',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.tx.InfoLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.fx.FXTransaction',
    'net.nanopay.iso20022.FIToFICustomerCreditTransferV06',
    'net.nanopay.iso20022.Pacs00800106',
    'net.nanopay.iso20022.PaymentIdentification3',
  ],

  constants: [
    {
      type: 'String',
      name: 'AFEX_SERVICE_NSPEC_ID',
      value: 'AFEXService'
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
      javaCode: `

    Logger logger = (Logger) x.get("logger");
    TransactionQuote quote = (TransactionQuote) obj;
    Transaction request = quote.getRequestTransaction();
    logger.debug(this.getClass().getSimpleName(), "put", quote);

    Account sourceAccount = request.findSourceAccount(x);
    Account destinationAccount = request.findDestinationAccount(x);

    // Check if AFEX can handle this transaction
    if ( ! (sourceAccount instanceof BankAccount) || ! (destinationAccount instanceof BankAccount) ) return getDelegate().put_(x, obj);

    // Check if AFEXTransactionPlanDAO can handle the currency combination
    FXService fxService = CurrencyFXService.getFXServiceByNSpecId(x, request.getSourceCurrency(),
      request.getDestinationCurrency(), AFEX_SERVICE_NSPEC_ID);
    if ( fxService instanceof AFEXServiceProvider  ) {

      // Validate that Payer is provisioned for AFEX before proceeding

      FXQuote fxQuote = new FXQuote.Builder(x).build();
      String pacsEndToEndId = getPacs008EndToEndId(request);
      if ( ! SafetyUtil.isEmpty(pacsEndToEndId) ) {
        fxQuote = FXQuote.lookUpFXQuote(x, pacsEndToEndId, request.getPayerId());
      }

      // FX Rate has not yet been fetched
      if ( fxQuote.getId() < 1 ) {
        try {
          AFEXServiceProvider afexService = (AFEXServiceProvider) fxService;

          fxQuote = afexService.getFXRate(request.getSourceCurrency(),
            request.getDestinationCurrency(), request.getAmount(), request.getDestinationAmount(),
            FXDirection.Buy.getName(), null, request.findSourceAccount(x).getOwner(), null);
          if ( fxQuote != null && fxQuote.getId() > 0 ) {
            AFEXTransaction afexTransaction = createAFEXTransaction(x, request, fxQuote);
            afexTransaction.setPayerId(sourceAccount.getOwner());
            afexTransaction.setPayeeId(destinationAccount.getOwner());
            quote.addPlan(afexTransaction);
          }
          
        } catch (Throwable t) {
          String message = "Unable to get FX quotes for source currency: "+ request.getSourceCurrency() + " and destination currency: " + request.getDestinationCurrency() + " from AFEX" ;
          Notification notification = new Notification.Builder(x)
            .setTemplate("NOC")
            .setBody(message)
            .build();
            ((DAO) x.get("notificationDAO")).put(notification);
            ((Logger) x.get("logger")).error("Error sending GetQuote to AFEX.", t);
        }
      } else  {
        AFEXTransaction afexTransaction = createAFEXTransaction(x, request, fxQuote);
        afexTransaction.setPayerId(sourceAccount.getOwner());
        afexTransaction.setPayeeId(destinationAccount.getOwner());
        quote.addPlan(afexTransaction);
      }

    }
    return getDelegate().put_(x, quote);
    `
  },
  {
    name: 'getPacs008EndToEndId',
    args: [
      {
        type: 'net.nanopay.tx.model.Transaction',
        name: 'transaction'
      }
    ],
    type: 'String',
    javaCode: `
    String pacsEndToEndId = null;
    if ( transaction.getReferenceData() != null && transaction.getReferenceData().length > 0 ) {
      for ( FObject obj : transaction.getReferenceData() ) {
        if ( obj instanceof Pacs00800106 ) {
          Pacs00800106 pacs = (Pacs00800106) obj;
          FIToFICustomerCreditTransferV06 fi = pacs.getFIToFICstmrCdtTrf();
          if ( fi != null && fi.getCreditTransferTransactionInformation() != null && fi.getCreditTransferTransactionInformation().length > 0 ) {
            PaymentIdentification3 pi = fi.getCreditTransferTransactionInformation()[0].getPaymentIdentification();
            pacsEndToEndId =  pi != null ? pi.getEndToEndIdentification() : null ;
          }
          break;
        }
      }
    }
    return pacsEndToEndId;
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
protected AFEXTransaction createAFEXTransaction(foam.core.X x, Transaction request, FXQuote fxQuote) {
  AFEXTransaction afexTransaction = new AFEXTransaction.Builder(x).build();
  // afexTransaction.copyFrom(request);
  // afexTransaction.setFxExpiry(fxQuote.getExpiryTime());
  // afexTransaction.setFxQuoteId(String.valueOf(fxQuote.getId()));
  // afexTransaction.setFxRate(fxQuote.getRate());
  // afexTransaction.addLineItems(new TransactionLineItem[] {new FXLineItem.Builder(x).setGroup("fx").setRate(fxQuote.getRate()).setQuoteId(String.valueOf(fxQuote.getId())).setExpiry(fxQuote.getExpiryTime()).setAccepted(ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus())).build()}, null);
  // afexTransaction.setDestinationAmount((new Double(fxQuote.getTargetAmount())).longValue());
  // FeesFields fees = new FeesFields.Builder(x).build();
  // fees.setTotalFees(fxQuote.getFee());
  // fees.setTotalFeesCurrency(fxQuote.getFeeCurrency());
  // afexTransaction.addLineItems(new TransactionLineItem[] {new AFEXFeeLineItem.Builder(x).setGroup("fx").setAmount(fxQuote.getFee()).setCurrency(fxQuote.getFeeCurrency()).build()}, null);
  // afexTransaction.setFxFees(fees);
  // afexTransaction.setIsQuoted(true);
  // afexTransaction.setPaymentMethod(fxQuote.getPaymentMethod());
  // if ( afexTransaction.getAmount() < 1 ) afexTransaction.setAmount(fxQuote.getSourceAmount());
  // if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()))
  // {
  //   afexTransaction.setAccepted(true);
  // }

  // afexTransaction.addLineItems(new TransactionLineItem[] {new ETALineItem.Builder(x).setGroup("fx").setEta(/* 2 days TODO: calculate*/172800000L).build()}, null);
  return afexTransaction;
}
        `);
      },
    },
  ]
 });
