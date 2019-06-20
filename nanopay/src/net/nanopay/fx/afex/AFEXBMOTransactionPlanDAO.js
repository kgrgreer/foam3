foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBMOTransactionPlanDAO',
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
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
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
    'net.nanopay.model.Currency',
    'net.nanopay.tx.alterna.AlternaCOTransaction',
    'net.nanopay.tx.alterna.AlternaCITransaction'
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
  
      if ( sourceAccount instanceof USBankAccount && destinationAccount instanceof CABankAccount ) {
        return createUSDCAD(x, quote, sourceAccount, destinationAccount);
      } else if( sourceAccount instanceof CABankAccount && destinationAccount instanceof USBankAccount ) {
        return createCADUSD(x, quote, sourceAccount, destinationAccount);
      } else {
        return getDelegate().put_(x, quote);
      }
    `
  },
  {
    name: 'createUSDCAD',
    type: 'foam.core.FObject',
    args: [
      { name: 'x', type: 'foam.core.X ' },
      { name: 'quote', type: 'TransactionQuote ' },
      { name: 'sourceAccount', type: 'net.nanopay.account.Account ' },
      { name: 'destAccount', type: 'net.nanopay.account.Account' },
    ],
    javaCode: `
    // Deposit USD into CAD BMO using AFEX, CADBMO to CAD bank
    DigitalAccount bmoAccount = TrustAccount.findDefault(x,sourceAccount.findOwner(x),"CAD");

    Transaction request = quote.getRequestTransaction();

    AFEXTransaction afexTransaction = getAFEXTransaction(x, "USD", "CAD", request.getAmount(), request.getDestinationAmount(), destAccount, bmoAccount); 

    if ( afexTransaction != null ) {
      // create BMO CO transaction
      AlternaCOTransaction bmoCO = new AlternaCOTransaction();
      bmoCO.copyFrom(request);
      bmoCO.setSourceAccount(bmoAccount.getId());//set to bmo
      bmoCO.setAmount(afexTransaction.getDestinationAmount());
      bmoCO.setDestinationAccount(destAccount.getId());
      bmoCO.setDestinationAmount(afexTransaction.getDestinationAmount());

      // add BMO CO as child of afexTransaction
      afexTransaction.addNext(bmoCO);

      // add afexTransaction to quote
      quote.addPlan(afexTransaction);
    }

    return getDelegate().put_(x, quote);
    `
  },
  {
    name: 'createCADUSD',
    type: 'foam.core.FObject',
    args: [
      { name: 'x', type: 'foam.core.X ' },
      { name: 'quote', type: 'TransactionQuote ' },
      { name: 'sourceAccount', type: 'net.nanopay.account.Account ' },
      { name: 'destinationAccount', type: 'net.nanopay.account.Account' },
    ],
    javaCode: `

    // Deposit CAD into CAD BMO using AFEX, BMO transaction to USD bank
    DigitalAccount bmoAccount = TrustAccount.findDefault(x,sourceAccount.findOwner(x),"CAD");

    Transaction request = quote.getRequestTransaction();

    AFEXTransaction afexTransaction = getAFEXTransaction(x,"CAD", "USD", request.getAmount(),request.getDestinationAmount(),bmoAccount,destinationAccount );

    if ( afexTransaction != null ) {
      // create BMO CI transaction
      AlternaCITransaction bmoCI = new AlternaCITransaction();
      bmoCI.copyFrom(request);
      bmoCI.setSourceAccount(sourceAccount.getId());
      bmoCI.setAmount(afexTransaction.getAmount());
      bmoCI.setDestinationAccount(bmoAccount.getId());
      bmoCI.setDestinationAmount(afexTransaction.getAmount());

      // set afexTransaction as child of bmo
      bmoCI.addNext(afexTransaction);

      // add afexTransaction to quote
      quote.addPlan(bmoCI);
    }
    return getDelegate().put_(x, quote);
    `
  },
  {
    name: 'getAFEXTransaction',
    type: 'net.nanopay.fx.afex.AFEXTransaction',
    args: [
      { name: 'x', type: 'foam.core.X ' },
      { name: 'sourceCurrency', type: 'String ' },
      { name: 'destinationCurrency', type: 'String' },
      { name: 'amount', type: 'Long' },
      { name: 'destinationAmount', type: 'Long' },
      { name: 'sourceAccount', type: 'net.nanopay.account.Account ' },
      { name: 'destinationAccount', type: 'net.nanopay.account.Account' }
    ],
    javaCode: `
    try {
      FXService fxService = CurrencyFXService.getFXServiceByNSpecId(x, sourceCurrency, destinationCurrency, AFEX_SERVICE_NSPEC_ID);
      AFEXServiceProvider afexService = (AFEXServiceProvider) fxService;
      FXQuote fxQuote = new FXQuote.Builder(x).build();
      
      fxQuote = afexService.getFXRate(sourceCurrency, destinationCurrency, amount , destinationAmount,
        null, null, sourceAccount.getOwner(), null);
      if ( fxQuote != null && fxQuote.getId() > 0 ) {
        AFEXTransaction afexTransaction = createAFEXTransaction(x, fxQuote, amount, destinationAmount );
        afexTransaction.setPayerId(sourceAccount.getOwner());
        afexTransaction.setSourceAccount(sourceAccount.getId());
        afexTransaction.setPayeeId(destinationAccount.getOwner());
        afexTransaction.setDestinationAccount(destinationAccount.getId());
        return afexTransaction;
      }
    } catch (Throwable t) {
      String message = "Unable to get FX quotes for source currency: "+ sourceCurrency + " and destination currency: " + destinationCurrency + " from AFEX" ;
      Notification notification = new Notification.Builder(x)
        .setTemplate("NOC")
        .setBody(message)
        .build();
        ((DAO) x.get("notificationDAO")).put(notification);
        ((Logger) x.get("logger")).error("Error sending GetQuote to AFEX.", t);
    }
    return null;
    `
  }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
protected AFEXTransaction createAFEXTransaction(foam.core.X x, FXQuote fxQuote, long invoiceAmount, long destinationAmount ) {

  AFEXTransaction afexTransaction = new AFEXTransaction.Builder(x).build();
 
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
  Currency currency = (Currency) currencyDAO.find(fxQuote.getSourceCurrency());
  double amount = invoiceAmount > 0 ? invoiceAmount: destinationAmount;
  double sourceAmount = amount / Math.pow(10, currency.getPrecision()) * fxQuote.getRate();
  Long sourceAmountWithRate = Math.round(sourceAmount * 100);

  afexTransaction.setAmount( sourceAmountWithRate );
  afexTransaction.setSourceCurrency(fxQuote.getSourceCurrency());
  afexTransaction.setDestinationAmount(invoiceAmount > 0 ? invoiceAmount: destinationAmount);
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
