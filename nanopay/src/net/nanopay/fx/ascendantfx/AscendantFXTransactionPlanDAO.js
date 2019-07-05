foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.documents.AcceptanceDocument',
    'net.nanopay.documents.AcceptanceDocumentService',
    'net.nanopay.documents.AcceptanceDocumentType',
    'net.nanopay.fx.CurrencyFXService',
    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.fx.FeesFields',
    'net.nanopay.fx.FXDirection',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.FXService',
    'net.nanopay.iso20022.FIToFICustomerCreditTransferV06',
    'net.nanopay.iso20022.Pacs00800106',
    'net.nanopay.iso20022.PaymentIdentification3',
    'net.nanopay.tx.DisclosureLineItem',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote'
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
      javaCode: `TransactionQuote quote = (TransactionQuote) obj;
      Transaction request = quote.getRequestTransaction();

      if ( request.getDestinationCurrency().equals("CAD") && request.getSourceCurrency().equals("CAD") ) {
        return getDelegate().put_(x, obj);
      }

      Account sourceAccount = quote.getSourceAccount();
      Account destinationAccount = quote.getDestinationAccount();
      if ( ! (sourceAccount instanceof BankAccount) ||
           ! (destinationAccount instanceof BankAccount) ) {
         return getDelegate().put_(x, obj);
      }

      Logger logger = (Logger) x.get("logger");
      // Create and execute AscendantFXTransaction to get Rate
      // store in plan

      // Check if AscendantFXTransactionPlanDAO can handle the currency combination
      FXService fxService = CurrencyFXService.getFXServiceByNSpecId(x, request.getSourceCurrency(),
        request.getDestinationCurrency(), ASCENDANTFX_SERVICE_NSPEC_ID);
      if ( fxService instanceof AscendantFXServiceProvider  ) {

        try {
          // Validate that Payer is provisioned for AFX before proceeding
          AscendantFXUser.getUserAscendantFXOrgId(x, sourceAccount.getOwner());
        } catch (Exception e) {
          logger.info(e.getMessage());
          return getDelegate().put_(x, quote);
        }

        // Add Disclosure line item
        AcceptanceDocument disclosure = null;
        User payer = User.findUser(x, sourceAccount.getOwner());
        if ( null != payer && null != payer.getAddress() ) {
          AcceptanceDocumentService acceptanceDocumentService = (AcceptanceDocumentService) x.get("acceptanceDocumentService");
          disclosure = acceptanceDocumentService.getTransactionRegionDocuments(x, "AscendantFXTransaction",
            AcceptanceDocumentType.DISCLOSURE, payer.getAddress().getCountryId(), payer.getAddress().getRegionId());
        }

        // TODO: test if fx already done
        FXQuote fxQuote = new FXQuote.Builder(x).build();
        FXQuote requestFXQuote = getFXQuoteFromReferenceData(request);
        if ( null != requestFXQuote ) {
          fxQuote = requestFXQuote;
        } else {
          String pacsEndToEndId = getPacs008EndToEndId(request);
          if ( ! SafetyUtil.isEmpty(pacsEndToEndId) ) {
            fxQuote = FXQuote.lookUpFXQuote(x, pacsEndToEndId, request.getPayerId());
          }
        }

        // FX Rate has not yet been fetched
        if ( fxQuote.getId() < 1 ) {
          try {
            AscendantFXServiceProvider ascendantFXService = (AscendantFXServiceProvider) fxService;
            if ( SafetyUtil.isEmpty(request.getPaymentMethod()) ) {
              for ( AscendantFXPaymentMethodType paymentMethod : AscendantFXPaymentMethodType.values() ) {
                fxQuote = ascendantFXService.getFXRateWithPaymentMethod(request.getSourceCurrency(),
                  request.getDestinationCurrency(), request.getAmount(), request.getDestinationAmount(),
                  FXDirection.Buy.getName(), null, request.findSourceAccount(x).getOwner(), null, paymentMethod.getName());
                  if ( null != fxQuote && fxQuote.getId() > 0 ) {
                    AscendantFXTransaction ascendantFXTransaction = createAscendantFXTransaction(x, request, fxQuote);
                    ascendantFXTransaction.setPayerId(sourceAccount.getOwner());
                    ascendantFXTransaction.setPayeeId(destinationAccount.getOwner());
                    if ( null != disclosure ) {
                      ascendantFXTransaction.addLineItems(new TransactionLineItem[] {new DisclosureLineItem.Builder(x).setGroup("fx").setText(disclosure.getBody()).build()}, null);
                    }
                    quote.addPlan(ascendantFXTransaction);
                  }
              }
            } else {
              fxQuote = ascendantFXService.getFXRateWithPaymentMethod(request.getSourceCurrency(),
                request.getDestinationCurrency(), request.getAmount(), request.getDestinationAmount(),
                FXDirection.Buy.getName(), null, request.findSourceAccount(x).getOwner(), null, request.getPaymentMethod());
                if ( null != fxQuote && fxQuote.getId() > 0 ) {
                  AscendantFXTransaction ascendantFXTransaction = createAscendantFXTransaction(x, request, fxQuote);
                  ascendantFXTransaction.setPayerId(sourceAccount.getOwner());
                  ascendantFXTransaction.setPayeeId(destinationAccount.getOwner());
                  if ( null != disclosure ) {
                    ascendantFXTransaction.addLineItems(new TransactionLineItem[] {new DisclosureLineItem.Builder(x).setGroup("fx").setText(disclosure.getBody()).build()}, null);
                  }
                  quote.addPlan(ascendantFXTransaction);
                }
            }
          } catch (Throwable t) {
            String message = "Unable to get FX quotes for source currency: "+ request.getSourceCurrency() + " and destination currency: " + request.getDestinationCurrency() + " from AscendantFX" ;
            Notification notification = new Notification.Builder(x)
              .setTemplate("NOC")
              .setBody(message)
              .build();
              ((DAO) x.get("notificationDAO")).put(notification);
              ((Logger) x.get("logger")).error("Error sending GetQuote to AscendantFX.", t);
          }
        } else  {
          AscendantFXTransaction ascendantFXTransaction = createAscendantFXTransaction(x, request, fxQuote);
          ascendantFXTransaction.setPayerId(sourceAccount.getOwner());
          ascendantFXTransaction.setPayeeId(destinationAccount.getOwner());
          if ( null != disclosure ) {
            ascendantFXTransaction.addLineItems(new TransactionLineItem[] {new DisclosureLineItem.Builder(x).setGroup("fx").setText(disclosure.getBody()).build()}, null);
          }
          quote.addPlan(ascendantFXTransaction);
        }

      }
      return getDelegate().put_(x, quote); `
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
    if ( null != transaction.getReferenceData() && transaction.getReferenceData().length > 0 ) {
      for ( FObject obj : transaction.getReferenceData() ) {
        if ( obj instanceof Pacs00800106 ) {
          Pacs00800106 pacs = (Pacs00800106) obj;
          FIToFICustomerCreditTransferV06 fi = pacs.getFIToFICstmrCdtTrf();
          if ( null != fi && null != fi.getCreditTransferTransactionInformation() && fi.getCreditTransferTransactionInformation().length > 0 ) {
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
protected AscendantFXTransaction createAscendantFXTransaction(foam.core.X x, Transaction request, FXQuote fxQuote) {
  AscendantFXTransaction ascendantFXTransaction = new AscendantFXTransaction.Builder(x).build();
  ascendantFXTransaction.copyFrom(request);
  ascendantFXTransaction.setFxExpiry(fxQuote.getExpiryTime());
  ascendantFXTransaction.setFxQuoteId(String.valueOf(fxQuote.getId()));
  ascendantFXTransaction.setFxRate(fxQuote.getRate());
  ascendantFXTransaction.addLineItems(new TransactionLineItem[] {new FXLineItem.Builder(x).setGroup("fx").setRate(fxQuote.getRate()).setQuoteId(String.valueOf(fxQuote.getId())).setExpiry(fxQuote.getExpiryTime()).setAccepted(ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus())).build()}, null);
  ascendantFXTransaction.setDestinationAmount((new Double(fxQuote.getTargetAmount())).longValue());
  FeesFields fees = new FeesFields.Builder(x).build();
  fees.setTotalFees(fxQuote.getFee());
  fees.setTotalFeesCurrency(fxQuote.getFeeCurrency());
  ascendantFXTransaction.addLineItems(new TransactionLineItem[] {new AscendantFXFeeLineItem.Builder(x).setGroup("fx").setAmount(fxQuote.getFee()).setCurrency(fxQuote.getFeeCurrency()).build()}, null);
  ascendantFXTransaction.setFxFees(fees);
  ascendantFXTransaction.setIsQuoted(true);
  ascendantFXTransaction.setPaymentMethod(fxQuote.getPaymentMethod());
  if ( ascendantFXTransaction.getAmount() < 1 ) ascendantFXTransaction.setAmount(fxQuote.getSourceAmount());
  if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()))
  {
    ascendantFXTransaction.setAccepted(true);
  }

  ascendantFXTransaction.addLineItems(new TransactionLineItem[] {new ETALineItem.Builder(x).setGroup("fx").setEta(/* 2 days TODO: calculate*/172800000L).build()}, null);
  return ascendantFXTransaction;
}

protected FXQuote getFXQuoteFromReferenceData(Transaction request) {
  FXQuote fxQuote = null;
  if ( null != request.getReferenceData() && request.getReferenceData().length > 0 ) {
    for ( Object obj : request.getReferenceData() ) {
      if ( obj instanceof FXQuote ) {
        fxQuote = (FXQuote) obj;
        break;
      }
    }
  }
  return fxQuote;
}
        `);
      },
    },
  ]
});
