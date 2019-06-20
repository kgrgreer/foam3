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
    'net.nanopay.model.Currency'
  ],

  constants: [
    {
      type: 'String',
      name: 'AFEX_SERVICE_NSPEC_ID',
      value: 'afexService'
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

    TransactionQuote quote = (TransactionQuote) obj;

    if ( ! this.getEnabled() ) {
      getDelegate().put_(x, quote);
    }

    Logger logger = (Logger) x.get("logger");
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

      // TODO: Validate that Payer is provisioned for AFEX before proceeding

      FXQuote fxQuote = new FXQuote.Builder(x).build();

      // FX Rate has not yet been fetched
      if ( fxQuote.getId() < 1 ) {
        try {
          AFEXServiceProvider afexService = (AFEXServiceProvider) fxService;

          fxQuote = afexService.getFXRate(request.getSourceCurrency(), request.getDestinationCurrency(), request.getAmount(), request.getDestinationAmount(),
            null, null, request.findSourceAccount(x).getOwner(), null);
          if ( fxQuote != null && fxQuote.getId() > 0 ) {
            AFEXTransaction afexTransaction = createAFEXTransaction(x, request, fxQuote);
            afexTransaction.setPayerId(sourceAccount.getOwner());
            afexTransaction.setSourceAccount(sourceAccount.getId());
            afexTransaction.setPayeeId(destinationAccount.getOwner());
            afexTransaction.setDestinationAccount(destinationAccount.getId());
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
  }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
protected AFEXTransaction createAFEXTransaction(foam.core.X x, Transaction request, FXQuote fxQuote) {
  AFEXTransaction afexTransaction = new AFEXTransaction.Builder(x).build();
  afexTransaction.copyFrom(request);
 
  afexTransaction.setFxExpiry(fxQuote.getExpiryTime());
  afexTransaction.setFxQuoteId(String.valueOf(fxQuote.getId()));
  afexTransaction.setFxRate(fxQuote.getRate());
  afexTransaction.addLineItems(new TransactionLineItem[] {new FXLineItem.Builder(x).setGroup("fx").setRate(fxQuote.getRate()).setQuoteId(String.valueOf(fxQuote.getId())).setExpiry(fxQuote.getExpiryTime()).setAccepted(ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus())).build()}, null);

  FeesFields fees = new FeesFields.Builder(x).build();
  fees.setTotalFees(fxQuote.getFee());
  fees.setTotalFeesCurrency(fxQuote.getFeeCurrency());
  afexTransaction.addLineItems(new TransactionLineItem[] {new FeeLineItem.Builder(x).setGroup("fx").setAmount(fxQuote.getFee()).setCurrency(fxQuote.getFeeCurrency()).build()}, null);
  afexTransaction.setFxFees(fees);
  
  afexTransaction.setIsQuoted(true);
  afexTransaction.setPaymentMethod(fxQuote.getPaymentMethod());

  // Currency conversion
  DAO currencyDAO = (DAO) x.get("currencyDAO");
  Currency currency = (Currency) currencyDAO.find(request.getSourceCurrency());
  double amount = request.getAmount() > 0 ? request.getAmount() : request.getDestinationAmount();
  double sourceAmount = amount / Math.pow(10, currency.getPrecision()) * fxQuote.getRate();
  Long sourceAmountWithRate = Math.round(sourceAmount * 100);

  afexTransaction.setAmount( sourceAmountWithRate );
  afexTransaction.setSourceCurrency(fxQuote.getSourceCurrency());
  afexTransaction.setDestinationAmount(request.getAmount() > 0 ? request.getAmount() : request.getDestinationAmount());
  afexTransaction.setDestinationCurrency(fxQuote.getTargetCurrency());
  
  if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()))
  {
    afexTransaction.setAccepted(true);
  }

  afexTransaction.addLineItems(new TransactionLineItem[] {new ETALineItem.Builder(x).setGroup("fx").setEta(/* 2 days TODO: calculate*/172800000L).build()}, null);
  return afexTransaction;
}
        `);
      },
    },
  ]
 });
