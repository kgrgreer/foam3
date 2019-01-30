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
    'foam.core.FObject',
    'foam.nanos.notification.Notification',

    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.INBankAccount',
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
    'net.nanopay.fx.ascendantfx.model.Deal',
    'net.nanopay.fx.ascendantfx.model.Direction',
    'net.nanopay.fx.ascendantfx.model.GetQuoteRequest',
    'net.nanopay.fx.ascendantfx.model.GetQuoteResult',
    'net.nanopay.fx.ascendantfx.AscendantFXPaymentMethodType',
    'net.nanopay.fx.ascendantfx.model.Quote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.fx.FXTransaction',
    'net.nanopay.iso20022.FIToFICustomerCreditTransferV06',
    'net.nanopay.iso20022.Pacs00800106',
    'net.nanopay.iso20022.PaymentIdentification3',
    'net.nanopay.fx.ascendantfx.AscendantFXDisclosure',
    'net.nanopay.tx.DisclosureLineItem'

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

    Logger logger = (Logger) x.get("logger");

    TransactionQuote quote = (TransactionQuote) obj;
    Transaction request = quote.getRequestTransaction();

    Account sourceAccount = request.findSourceAccount(x);
    Account destinationAccount = request.findDestinationAccount(x);

    if ( ! (sourceAccount instanceof BankAccount) || ! (destinationAccount instanceof BankAccount) ) return getDelegate().put_(x, obj);

    // Create and execute AscendantFXTransaction to get Rate
    // store in plan

    // Check if AscendantFXTransactionPlanDAO can handle the currency combination
    FXService fxService = CurrencyFXService.getFXServiceByNSpecId(x, request.getSourceCurrency(),
      request.getDestinationCurrency(), ASCENDANTFX_SERVICE_NSPEC_ID);
    if ( fxService instanceof AscendantFXServiceProvider  ) {

      // Add Disclosure line item
      AscendantFXDisclosure disclosure = null;
      User payer = User.findUser(x, sourceAccount.getOwner());
      if ( null != payer && null != payer.getAddress() ) {
        disclosure = (AscendantFXDisclosure) ((DAO) x.get("disclosuresDAO"))
          .find(MLang.AND(MLang.INSTANCE_OF(AscendantFXDisclosure.class),
          MLang.EQ(AscendantFXDisclosure.COUNTRY, payer.getAddress().getCountryId()),
          MLang.EQ(AscendantFXDisclosure.STATE, payer.getAddress().getRegionId())));
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
                    ascendantFXTransaction.addLineItems(new TransactionLineItem[] {new DisclosureLineItem.Builder(x).setGroup("fx").setDisclosure(disclosure).build()}, null);
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
                  ascendantFXTransaction.addLineItems(new TransactionLineItem[] {new DisclosureLineItem.Builder(x).setGroup("fx").setDisclosure(disclosure).build()}, null);
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
          ascendantFXTransaction.addLineItems(new TransactionLineItem[] {new DisclosureLineItem.Builder(x).setGroup("fx").setDisclosure(disclosure).build()}, null);
        }
        quote.addPlan(ascendantFXTransaction);
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
