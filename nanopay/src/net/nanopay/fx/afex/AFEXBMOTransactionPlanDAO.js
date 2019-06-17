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
  
      if ( sourceAccount instanceof USBankAccount && destinationAccount instanceof CABankAccount ) {
        return createCADUSD(x, quote, sourceAccount, destinationAccount);
      } else if( sourceAccount instanceof CABankAccount && destinationAccount instanceof USBankAccount ) {
        return createUSDCAD(x, quote, sourceAccount, destinationAccount);
      } else {
        return getDelegate().put_(x, quote);
      }
    `
  },
  {
    name: 'createCADUSD',
    type: 'foam.core.FObject',
    args: [
      { name: 'x', type: 'foam.core.X ' },
      { name: 'quote', type: 'TransactionQuote ' },
      { name: 'sourceAccount', type: 'net.nanopay.account.Account ' },
      { name: 'destAccount', type: 'net.nanopay.account.Account' },
    ],
    javaCode: `
    // Deposit CAD into CAD BMO or USD BMO? pay from USD BMO?
    Account bmoAccount = new Account();
    String bmoCurrency = "USD";

    Transaction request = quote.getRequestTransaction();

    AFEXTransaction afexTransaction = getAFEXTransaction(x, bmoCurrency, request.getDestinationCurrency(),request.getAmount(), request.getAmount(), bmoAccount, destAccount); 
    // create BMO CO transaction 
    if ( afexTransaction != null ) {
      // add BMO CO as child of afexTransaction
      // add afexTransaction to quote
    }
    return getDelegate().put_(x, quote);
    `
  },
  {
    name: 'createUSDCAD',
    type: 'foam.core.FObject',
    args: [
      { name: 'x', type: 'foam.core.X ' },
      { name: 'quote', type: 'TransactionQuote ' },
      { name: 'sourceAccount', type: 'net.nanopay.account.Account ' },
      { name: 'destinationAccount', type: 'net.nanopay.account.Account' },
    ],
    javaCode: `

    // Deposit USD into USD BMO or CAD BMO? pay from CAD BMO
    Account bmoAccount = new Account();
    String bmoCurrency = "USD";

    Transaction request = quote.getRequestTransaction();

    // create BMO CI transaction
    AFEXTransaction afexTransaction = getAFEXTransaction(x, request.getSourceCurrency(), bmoCurrency,request.getAmount(),request.getAmount(),sourceAccount,bmoAccount );
    if ( afexTransaction != null ) {
      // add afexTransaction as a child of BMO CI
      // add BMO CI to quote
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
      { name: 'sourceAmount', type: 'Long' },
      { name: 'destinationAmount', type: 'Long' },
      { name: 'sourceAccount', type: 'net.nanopay.account.Account ' },
      { name: 'destinationAccount', type: 'net.nanopay.account.Account' }
    ],
    javaCode: `
    try {
      FXService fxService = CurrencyFXService.getFXServiceByNSpecId(x, sourceCurrency, destinationCurrency, AFEX_SERVICE_NSPEC_ID);
      AFEXServiceProvider afexService = (AFEXServiceProvider) fxService;
      FXQuote fxQuote = new FXQuote.Builder(x).build();
      
      fxQuote = afexService.getFXRate(sourceCurrency, destinationCurrency, sourceAmount , destinationAmount,
        FXDirection.Buy.getName(), null, sourceAccount.getOwner(), null);
      if ( fxQuote != null && fxQuote.getId() > 0 ) {
        AFEXTransaction afexTransaction = createAFEXTransaction(x, fxQuote);
        afexTransaction.setPayerId(sourceAccount.getOwner());
        afexTransaction.setSourceAccount(sourceAccount.getId());
        afexTransaction.setPayeeId(destinationAccount.getOwner());
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
protected AFEXTransaction createAFEXTransaction(foam.core.X x, FXQuote fxQuote) {
  AFEXTransaction afexTransaction = new AFEXTransaction.Builder(x).build();
 
  afexTransaction.setFxExpiry(fxQuote.getExpiryTime());
  afexTransaction.setFxQuoteId(String.valueOf(fxQuote.getId()));
  afexTransaction.setFxRate(fxQuote.getRate());
  afexTransaction.addLineItems(new TransactionLineItem[] {new FXLineItem.Builder(x).setGroup("fx").setRate(fxQuote.getRate()).setQuoteId(String.valueOf(fxQuote.getId())).setExpiry(fxQuote.getExpiryTime()).setAccepted(ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus())).build()}, null);
  afexTransaction.setDestinationAmount((new Double(fxQuote.getTargetAmount())).longValue());
 
  FeesFields fees = new FeesFields.Builder(x).build();
  fees.setTotalFees(fxQuote.getFee());
  fees.setTotalFeesCurrency(fxQuote.getFeeCurrency());
  afexTransaction.addLineItems(new TransactionLineItem[] {new FeeLineItem.Builder(x).setGroup("fx").setAmount(fxQuote.getFee()).setCurrency(fxQuote.getFeeCurrency()).build()}, null);
  afexTransaction.setFxFees(fees);
  
  afexTransaction.setIsQuoted(true);
  afexTransaction.setPaymentMethod(fxQuote.getPaymentMethod());
  if ( afexTransaction.getAmount() < 1 ) {
    afexTransaction.setAmount(fxQuote.getSourceAmount());
  }
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
