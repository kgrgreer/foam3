foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBMOTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'foam.nanos.app.Mode',
    'foam.nanos.app.AppConfig',
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
    'net.nanopay.fx.FXSummaryTransaction',
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
    'net.nanopay.exchangeable.Currency',
    'net.nanopay.tx.alterna.AlternaCOTransaction',
    'net.nanopay.tx.alterna.AlternaCITransaction'
  ],

  constants: [
    {
      type: 'String',
      name: 'AFEX_SERVICE_NSPEC_ID',
      value: 'afexServiceProvider'
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
        return getDelegate().put_(x, quote);
      }

      Logger logger = (Logger) x.get("logger");
      Transaction request = quote.getRequestTransaction();
      logger.debug(this.getClass().getSimpleName(), "put", quote);
  
      Account sourceAccount = request.findSourceAccount(x);
      Account destinationAccount = request.findDestinationAccount(x);
      Boolean isUSDCAD = null;
  
      // Check if AFEX can handle this transaction

      if ( sourceAccount instanceof USBankAccount && destinationAccount instanceof CABankAccount ) {
        isUSDCAD = true;
      } else if( sourceAccount instanceof CABankAccount && destinationAccount instanceof USBankAccount ) {
        isUSDCAD = false;
      } else {
        return getDelegate().put_(x, quote);
      }

      // Check if AFEXTransactionPlanDAO can handle the currency combination
      FXService fxService = null;
      // if ( ((AppConfig) x.get("appConfig")).getMode() == Mode.DEVELOPMENT ) {
      //   if ( (request.getSourceCurrency().equals("CAD") && request.getDestinationCurrency().equals("USD")) ||
      //   (request.getSourceCurrency().equals("USD") && request.getDestinationCurrency().equals("CAD")) ||
      //   (request.getSourceCurrency().equals("USD") && request.getDestinationCurrency().equals("USD")) ) {
      //     AFEX afex = new AFEXServiceMock(x);
      //     fxService = new AFEXServiceProvider(x, afex);
      //   }
      // } else {
        fxService = CurrencyFXService.getFXServiceByNSpecId(x, request.getSourceCurrency(),
        request.getDestinationCurrency(), AFEX_SERVICE_NSPEC_ID);
      // }

      if ( fxService instanceof AFEXServiceProvider  ) {
        fxService = (AFEXServiceProvider) fxService;
  
        // Validate that Payer is provisioned for AFEX before proceeding
        // if ( ((AppConfig) x.get("appConfig")).getMode() != Mode.TEST && ((AppConfig) x.get("appConfig")).getMode() != Mode.DEVELOPMENT  ) {
          AFEXBusiness afexBusiness = ((AFEXServiceProvider) fxService).getAFEXBusiness(x, sourceAccount.getOwner());
          if (afexBusiness == null) {
            logger.error("User not provisioned on AFEX " + sourceAccount.getOwner());
            return getDelegate().put_(x, quote);
          }
        // }
  
        if ( isUSDCAD ) {
          return createUSDCAD(x, quote, sourceAccount, destinationAccount);
        } else {
          return createCADUSD(x, quote, sourceAccount, destinationAccount);
        }
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
      { name: 'destAccount', type: 'net.nanopay.account.Account' },
    ],
    javaCode: `

    DigitalAccount sourceDigital = DigitalAccount.findDefault(x, sourceAccount.findOwner(x), "CAD");
    Transaction request = quote.getRequestTransaction();

    // AFEXTransaction go get money from sender source account to sender digital account
    AFEXTransaction afexTransaction = getAFEXTransaction(x, "USD", "CAD", request.getAmount(), request.getDestinationAmount(), sourceAccount, sourceDigital);

    // Add balance to sender digital account only????]
    if ( afexTransaction != null ) {
      // create BMO CO transaction
      DAO quoteDAO = (DAO) x.get("localTransactionQuotePlanDAO");
      TransactionQuote q1 = new TransactionQuote.Builder(x).build();
      Transaction co = new Transaction.Builder(x)
        .setAmount(afexTransaction.getDestinationAmount())
        .setDestinationAmount(afexTransaction.getDestinationAmount())
        .setDestinationAccount(destAccount.getId())
        .setSourceAccount(sourceDigital.getId())
        .setSourceCurrency(sourceDigital.getDenomination())
        .setDestinationCurrency(destAccount.getDenomination())
        .setPayerId(sourceDigital.getOwner())
        .setPayeeId(destAccount.getOwner())
        .build();
      q1.setRequestTransaction(co);
      TransactionQuote quoteTxn = (TransactionQuote) quoteDAO.put(q1);

      // add CO as a child of afexTransaction
      afexTransaction.addNext(quoteTxn.getPlan());

      // create summary transaction and add to quote
      FXSummaryTransaction summary = this.limitedCopyFrom(new FXSummaryTransaction(), afexTransaction);
      summary.setSourceAccount(sourceAccount.getId());
      summary.setDestinationAccount(destAccount.getId());
      summary.addNext(afexTransaction);
      quote.addPlan(summary);
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
    // TODO use bmo account
    DigitalAccount bmoAccount = TrustAccount.findDefault(x,sourceAccount.findOwner(x),"CAD");

    Transaction request = quote.getRequestTransaction();

    AFEXTransaction afexTransaction = getAFEXTransaction(x,"CAD", "USD", request.getAmount(),request.getDestinationAmount(),bmoAccount,destinationAccount );

    if ( afexTransaction != null ) {
      // create BMO CI transaction
      // TODO change to BMOTransaction
      AlternaCITransaction bmoCI = new AlternaCITransaction();
      bmoCI.copyFrom(request);
      bmoCI.setSourceAccount(sourceAccount.getId());
      bmoCI.setAmount(afexTransaction.getAmount());
      bmoCI.setSourceCurrency(sourceAccount.getDenomination());
      bmoCI.setDestinationAccount(bmoAccount.getId());
      bmoCI.setDestinationAmount(afexTransaction.getAmount());
      bmoCI.setDestinationCurrency(bmoAccount.getDenomination());
      bmoCI.setIsQuoted(true);

      // set afexTransaction as child of bmo
      bmoCI.addNext(afexTransaction);

      // create summary transaction and add to quote
      FXSummaryTransaction summary = this.limitedCopyFrom(new FXSummaryTransaction(), afexTransaction);
      summary.setSourceAccount(sourceAccount.getId());
      summary.setDestinationAccount(destinationAccount.getId());
      summary.setFxRate(afexTransaction.getFxRate());
      summary.addNext(bmoCI);
      quote.addPlan(summary);
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
        ((DAO) x.get("localNotificationDAO")).put(notification);
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
 // afexTransaction.setPaymentMethod(fxQuote.getPaymentMethod());

  afexTransaction.setAmount(fxQuote.getSourceAmount());
  afexTransaction.setSourceCurrency(fxQuote.getSourceCurrency());
  afexTransaction.setDestinationAmount(fxQuote.getTargetAmount());
  afexTransaction.setDestinationCurrency(fxQuote.getTargetCurrency());
  
  if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()))
  {
    afexTransaction.setAccepted(true);
  }

  // TODO change estimate based on bmo and afex
  afexTransaction.addLineItems(new TransactionLineItem[] {new ETALineItem.Builder(x).setGroup("fx").setEta(/* 2 days TODO: calculate*/172800000L).build()}, null);
  // TODO ADD FEES
  afexTransaction.setIsQuoted(true);

  return afexTransaction;
}

public FXSummaryTransaction limitedCopyFrom (FXSummaryTransaction summary, AFEXTransaction tx) {
  summary.setAmount(tx.getAmount());
  summary.setDestinationAmount(tx.getDestinationAmount());
  summary.setSourceCurrency(tx.getSourceCurrency());
  summary.setDestinationCurrency(tx.getDestinationCurrency());
  summary.setFxQuoteId(tx.getFxQuoteId());
  summary.setFxRate(tx.getFxRate());
  summary.setIsQuoted(true);
  return summary;
}
        `);
      },
    },
  ]
 });
