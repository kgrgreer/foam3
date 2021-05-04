/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'AscendantFXTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Plans Ascendant fx transactions.',

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
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.fx.ascendantfx.*',
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
    },
    {
      name: 'PAYMENT_PROVIDER',
      type: 'String',
      value: 'AscendantFX'
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
    
        FXService fxService = (FXService) x.get("ascendantFXService");

        // Add Disclosure line item
        AcceptanceDocument disclosure = null;
        User payer = User.findUser(x, quote.getSourceAccount().getOwner());
        if ( null != payer && null != payer.getAddress() ) {
          AcceptanceDocumentService acceptanceDocumentService = (AcceptanceDocumentService) x.get("acceptanceDocumentService");
          disclosure = acceptanceDocumentService.getTransactionRegionDocuments(x, "AscendantFXTransaction",
            AcceptanceDocumentType.DISCLOSURE, payer.getAddress().getCountryId(), payer.getAddress().getRegionId());
        }

        // TODO: test if fx already done
        FXQuote fxQuote = new FXQuote.Builder(x).build();
        FXQuote requestFXQuote = getFXQuoteFromReferenceData(requestTxn);
        if ( null != requestFXQuote ) {
          fxQuote = requestFXQuote;
        } else {
          String pacsEndToEndId = getPacs008EndToEndId(requestTxn);
          if ( ! SafetyUtil.isEmpty(pacsEndToEndId) ) {
            fxQuote = FXQuote.lookUpFXQuote(x, pacsEndToEndId, requestTxn.getPayerId());
          }
        }

        // FX Rate has not yet been fetched
        if ( fxQuote.getId() < 1 ) {
          try {
            AscendantFXServiceProvider ascendantFXService = (AscendantFXServiceProvider) fxService;
            // if ( SafetyUtil.isEmpty(requestTxn.getPaymentMethod()) ) {
              for ( AscendantFXPaymentMethodType paymentMethod : AscendantFXPaymentMethodType.values() ) {
                fxQuote = ascendantFXService.getFXRateWithPaymentMethod(requestTxn.getSourceCurrency(),
                requestTxn.getDestinationCurrency(), requestTxn.getAmount(), requestTxn.getDestinationAmount(),
                  FXDirection.BUY.getName(), null, quote.getSourceAccount().getOwner(), null, paymentMethod.getName());
                  if ( null != fxQuote && fxQuote.getId() > 0 ) {
                    AscendantFXTransaction ascendantFXTransaction = createAscendantFXTransaction(x, requestTxn, fxQuote);
                    if ( null != disclosure ) {
                      ascendantFXTransaction.addLineItems(new TransactionLineItem[] {new DisclosureLineItem.Builder(x).setGroup("fx").setText(disclosure.getBody()).build()} );
                    }
                    FXSummaryTransaction summaryTransaction = getSummaryTx(ascendantFXTransaction, quote.getSourceAccount(), quote.getDestinationAccount(), fxQuote);
                    return summaryTransaction;
                  }
              }
            // } else {
            //   fxQuote = ascendantFXService.getFXRateWithPaymentMethod(requestTxn.getSourceCurrency(),
            //     requestTxn.getDestinationCurrency(), requestTxn.getAmount(), requestTxn.getDestinationAmount(),
            //     FXDirection.BUY.getName(), null, quote.getSourceAccount().getOwner(), null, requestTxn.getPaymentMethod());
            //     if ( null != fxQuote && fxQuote.getId() > 0 ) {
            //       AscendantFXTransaction ascendantFXTransaction = createAscendantFXTransaction(x, requestTxn, fxQuote);
            //       if ( null != disclosure ) {
            //         ascendantFXTransaction.addLineItems(new TransactionLineItem[] {new DisclosureLineItem.Builder(x).setGroup("fx").setText(disclosure.getBody()).build()} );
            //       }
            //       quote.addPlan(ascendantFXTransaction);
            //     }
            // }
          } catch (Throwable t) {
            String message = "Unable to get FX quotes for source currency: "+ requestTxn.getSourceCurrency() + " and destination currency: " + requestTxn.getDestinationCurrency() + " from AscendantFX" ;
            Notification notification = new Notification.Builder(x)
              .setTemplate("NOC")
              .setBody(message)
              .build();
              ((DAO) x.get("localNotificationDAO")).put(notification);
              ((Logger) x.get("logger")).error("Error sending GetQuote to AscendantFX.", t);
          }
        } else  {
          AscendantFXTransaction ascendantFXTransaction = createAscendantFXTransaction(x, requestTxn, fxQuote);
          if ( null != disclosure ) {
            ascendantFXTransaction.addLineItems(new TransactionLineItem[] {new DisclosureLineItem.Builder(x).setGroup("fx").setText(disclosure.getBody()).build()} );
          }
          FXSummaryTransaction summaryTransaction = getSummaryTx(ascendantFXTransaction, quote.getSourceAccount(), quote.getDestinationAccount(), fxQuote);
          return summaryTransaction;
        }
        return null;
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
      if ( null != transaction.getExternalData() ) {
        for ( Object obj : transaction.getExternalData().values() ) {
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
    },
    {
      name: 'getFXQuoteFromReferenceData',
      args: [
        {
          type: 'Transaction',
          name: 'request'
        }
      ],
      javaType: 'FXQuote',
      javaCode: `
        FXQuote fxQuote = null;
        if ( null != request.getExternalData() ) {
          for ( Object obj : request.getExternalData().values() ) {
            if ( obj instanceof FXQuote ) {
              fxQuote = (FXQuote) obj;
              break;
            }
          }
        }
        return fxQuote;
      `
    },
    {
      name: 'createAscendantFXTransaction',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'Transaction',
          name: 'request'
        },
        {
          type: 'FXQuote',
          name: 'fxQuote'
        }
      ],
      javaType: 'AscendantFXTransaction',
      javaCode: `
      AscendantFXTransaction ascendantFXTransaction = new AscendantFXTransaction.Builder(x).build();
      ascendantFXTransaction.copyFrom(request);
      ascendantFXTransaction.setFxExpiry(fxQuote.getExpiryTime());
      ascendantFXTransaction.setFxQuoteId(String.valueOf(fxQuote.getId()));
      ascendantFXTransaction.setFxRate(fxQuote.getRate());
      ascendantFXTransaction.addLineItems( new TransactionLineItem[] {new FXLineItem.Builder(x).setGroup("fx").setRate(fxQuote.getRate()).setQuoteId(String.valueOf(fxQuote.getId())).setExpiry(fxQuote.getExpiryTime()).setAccepted(ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus())).setSourceCurrency(fxQuote.getSourceCurrency()).setDestinationCurrency(fxQuote.getTargetCurrency()).build()} );
      ascendantFXTransaction.setDestinationAmount(Math.round(new Double(fxQuote.getTargetAmount())));
      FeesFields fees = new FeesFields.Builder(x).build();
      fees.setTotalFees(fxQuote.getFee());
      fees.setTotalFeesCurrency(fxQuote.getFeeCurrency());
      ascendantFXTransaction.addLineItems( new TransactionLineItem[] {new AscendantFXFeeLineItem.Builder(x).setGroup("fx").setAmount(fxQuote.getFee()).setCurrency(fxQuote.getFeeCurrency()).build()} );
      ascendantFXTransaction.setFxFees(fees);
      ascendantFXTransaction.setPaymentProvider(PAYMENT_PROVIDER);
      ascendantFXTransaction.setPaymentMethod(fxQuote.getPaymentMethod());
      if ( ascendantFXTransaction.getAmount() < 1 ) ascendantFXTransaction.setAmount(fxQuote.getSourceAmount());
      if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()))
      {
        ascendantFXTransaction.setAccepted(true);
      }
    
      ascendantFXTransaction.addLineItems( new TransactionLineItem[] {new ETALineItem.Builder(x).setGroup("fx").setEta(/* 2 days TODO: calculate*/172800000L).build()} );
      return ascendantFXTransaction;
      `
    },
    {
      name: 'getSummaryTx',
      args: [
        {
          type: 'AscendantFXTransaction',
          name: 'tx'
        },
        {
          type: 'Account',
          name: 'sourceAccount'
        },
        {
          type: 'Account',
          name: 'destinationAccount'
        },
        {
          type: 'FXQuote',
          name: 'fxQuote'
        }
      ],
      javaType: 'FXSummaryTransaction',
      javaCode: `
        FXSummaryTransaction summary = new FXSummaryTransaction();
        summary.setAmount(tx.getAmount());
        summary.setDestinationAmount(tx.getDestinationAmount());
        summary.setSourceCurrency(tx.getSourceCurrency());
        summary.setDestinationCurrency(tx.getDestinationCurrency());
        summary.setFxQuoteId(tx.getFxQuoteId());
        summary.setSourceAccount(sourceAccount.getId());
        summary.setDestinationAccount(destinationAccount.getId());
        summary.setFxRate(tx.getFxRate());
        summary.setFxExpiry(tx.getFxExpiry());
        summary.setInvoiceId(tx.getInvoiceId());
        summary.addNext(tx);
        summary.addNext(createComplianceTransaction(tx));
        return summary;
      `
    }
  ]
});
