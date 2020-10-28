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
  name: 'AFEXTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Plans AFEX.',

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.dao.DAO',
    'foam.core.FObject',
    'foam.nanos.notification.Notification',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.fx.CurrencyFXService',
    'net.nanopay.fx.afex.AFEXBeneficiaryComplianceTransaction',
    'net.nanopay.fx.afex.AFEXBusiness',
    'net.nanopay.fx.afex.AFEXCredentials',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'net.nanopay.fx.afex.AFEXTransaction',
    'net.nanopay.fx.afex.AFEXFundingTransaction',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.partner.afex.AFEXDigitalAccount',
    'net.nanopay.tx.InfoLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.util.Date',
    'java.text.DateFormat',
    'java.text.SimpleDateFormat',
    'java.util.Locale',
    'java.util.UUID',
    'java.util.ArrayList',
    'static foam.mlang.MLang.*'
  ],

  constants: [
    {
      type: 'String',
      name: 'AFEX_SERVICE_NSPEC_ID',
      value: 'afexServiceProvider'
    },
    {
      name: 'PAYMENT_PROVIDER',
      type: 'String',
      value: 'AFEX'
    }
  ],

  properties: [
    {
      name: 'bestPlan',
      value: true
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
    
        AFEXServiceProvider fxService = (AFEXServiceProvider) x.get("afexServiceProvider");
        return generateTransaction(x, quote, (AFEXServiceProvider) fxService);
      `
    },
    {
      name: 'generateTransaction',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          type: 'TransactionQuote',
          name: 'quote'
        },
        {
          type: 'AFEXServiceProvider',
          name: 'afexService'
        }
      ],
      javaType: 'Transaction',
      javaCode: `
        Transaction request = quote.getRequestTransaction();
        Account sourceAccount = quote.getSourceAccount();
        Account destinationAccount = quote.getDestinationAccount();
        FXSummaryTransaction summary = null;
        Logger logger = (Logger) x.get("logger");
        logger.debug(this.getClass().getSimpleName(), "generateTransaction", quote);

        FXQuote fxQuote = new FXQuote.Builder(x).build();
        Long owner = quote.getRequestOwner() != 0 ? quote.getRequestOwner(): quote.getSourceAccount().getOwner();

        // FX Rate has not yet been fetched
        try {
          fxQuote = afexService.getFXRate(request.getSourceCurrency(), request.getDestinationCurrency(), request.getAmount(), request.getDestinationAmount(),
            null, null, owner, null);
          if ( fxQuote != null && fxQuote.getId() > 0 ) {
            AFEXTransaction afexTransaction = createAFEXTransaction(x, request, fxQuote, quote);
            afexTransaction.setSourceAccount(sourceAccount.getId());
            afexTransaction.setDestinationAccount(destinationAccount.getId());
            afexTransaction.setInvoiceId(request.getInvoiceId());
            summary = getSummaryTx(afexTransaction, sourceAccount, destinationAccount, fxQuote, quote, x);
          }
          
        } catch (Throwable t) {
          logger.error("error fetching afex fxQuote", t);
          String message = "Unable to get FX quotes for source currency: "+ request.getSourceCurrency() + " and destination currency: " + request.getDestinationCurrency() + " from AFEX" ;
          Notification notification = new Notification.Builder(x)
            .setTemplate("NOC")
            .setBody(message)
            .build();
            ((DAO) x.get("localNotificationDAO")).put(notification);
            logger.error("Error sending GetQuote to AFEX.", t);
        }
        return summary;
      `
    },
    {
      name: 'createAFEXTransaction',
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
        },
        {
          type: 'TransactionQuote',
          name: 'quote'
        }
      ],
      javaType: 'AFEXTransaction',
      javaCode: `
        ArrayList<TransactionLineItem> lines = new ArrayList<TransactionLineItem>();
        AFEXTransaction afexTransaction = new AFEXTransaction.Builder(x).build();
        afexTransaction.copyFrom(request);
        afexTransaction.setId(UUID.randomUUID().toString());
        afexTransaction.setStatus(TransactionStatus.PENDING);
        afexTransaction.setName("Foreign Exchange");
        afexTransaction.setFxExpiry(fxQuote.getExpiryTime());
        afexTransaction.setFxQuoteId(String.valueOf(fxQuote.getId()));
        afexTransaction.setFxRate(fxQuote.getRate());
        FXLineItem fxl = new FXLineItem.Builder(x)
          .setGroup("fx")
          .setRate(fxQuote.getRate())
          .setQuoteId(String.valueOf(fxQuote.getId())).setExpiry(fxQuote.getExpiryTime())
          .setAccepted(ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()))
          .setSourceCurrency(fxQuote.getSourceCurrency())
          .setDestinationCurrency(fxQuote.getTargetCurrency())
          .build();
        lines.add(fxl);

        afexTransaction.setFxExpiry(fxQuote.getExpiryTime());

        afexTransaction.setPaymentProvider(PAYMENT_PROVIDER);

        afexTransaction.setAmount(fxQuote.getSourceAmount());
        afexTransaction.setSourceCurrency(fxQuote.getSourceCurrency());
        afexTransaction.setDestinationAmount(fxQuote.getTargetAmount());
        afexTransaction.setDestinationCurrency(fxQuote.getTargetCurrency());
        afexTransaction.setPlanner(this.getId());

        if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()))
        {
          afexTransaction.setAccepted(true);
        }

        Date date = null;
        try{
          DateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.ENGLISH);
          date = format.parse(fxQuote.getValueDate());
        } catch ( Exception e) {

        }
        if ( date != null )
          lines.add(new ETALineItem.Builder(x).setGroup("fx").setEta(date.getTime() - new  Date().getTime()).build()) ;

        // TODO move to fee engine
        // add invoice fee
        Boolean sameCurrency = request.getSourceCurrency().equals(request.getDestinationCurrency());
        afexTransaction.addLineItems( lines.toArray(new TransactionLineItem[0]));
        return afexTransaction;
      `
    },
    {
      name: 'createFundingTransaction',
      args: [
        {
          type: 'Transaction',
          name: 'request'
        },
        {
          type: 'FXQuote',
          name: 'fxQuote'
        },
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'TransactionQuote',
          name: 'quote'
        }
      ],
      javaType: 'AFEXFundingTransaction',
      javaCode: `
        AFEXFundingTransaction fundingTransaction = new AFEXFundingTransaction();
        AFEXDigitalAccount afexDigital = createAFEXDigitalAccount(request, x, quote);

        fundingTransaction.copyFrom(request);
        fundingTransaction.setId(UUID.randomUUID().toString());
        fundingTransaction.setStatus(TransactionStatus.PENDING);
        fundingTransaction.setName("AFEX Funding Transaction");
        fundingTransaction.setFxExpiry(fxQuote.getExpiryTime());
        fundingTransaction.setFxQuoteId(String.valueOf(fxQuote.getId()));
        fundingTransaction.setFxRate(fxQuote.getRate());
        fundingTransaction.setPaymentProvider(PAYMENT_PROVIDER);
        fundingTransaction.setAmount(fxQuote.getSourceAmount());
        fundingTransaction.setSourceCurrency(fxQuote.getSourceCurrency());
        fundingTransaction.setDestinationAccount(afexDigital.getId());
        fundingTransaction.setDestinationAmount(fxQuote.getTargetAmount());
        fundingTransaction.setDestinationCurrency(fxQuote.getTargetCurrency());
        fundingTransaction.setPlanner(this.getId());
        fundingTransaction.setValueDate(fxQuote.getValueDate());
        fundingTransaction.clearLineItems();

        request.setSourceAccount(afexDigital.getId());

        return fundingTransaction;
      `
    },
    {
      name: 'getSummaryTx',
      args: [
        {
          type: 'AFEXTransaction',
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
        },
        {
          type: 'TransactionQuote',
          name: 'txnQuote'
        },
        {
          type: 'Context',
          name: 'x'
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
        summary.addNext(createComplianceTransaction(tx));

        // create AFEXBeneficiaryComplianceTransaction
        AFEXBeneficiaryComplianceTransaction afexCT = new AFEXBeneficiaryComplianceTransaction();
        afexCT.setId(UUID.randomUUID().toString());
        afexCT.setAmount(tx.getAmount());
        afexCT.setDestinationAmount(tx.getDestinationAmount());
        afexCT.setSourceCurrency(tx.getSourceCurrency());
        afexCT.setDestinationCurrency(tx.getDestinationCurrency());
        afexCT.setSourceAccount(sourceAccount.getId());
        afexCT.setDestinationAccount(destinationAccount.getId());
        afexCT.setInvoiceId(tx.getInvoiceId());
        afexCT.setPayeeId(tx.getPayeeId());
        afexCT.setPayerId(tx.getPayerId());
        afexCT.setPlanner(this.getId());

        if ( txnQuote.getParent() != null ) {
          AFEXFundingTransaction fundingTxn = createFundingTransaction(tx, fxQuote, x, txnQuote);
          afexCT.addNext(fundingTxn);
          afexCT.addNext(tx);
        } else {
          afexCT.addNext(tx);
        }
        
        summary.addNext(afexCT);
      
        return summary;
      `
    },
    {
      name: 'createAFEXDigitalAccount',
      args: [
        {
          type: 'Transaction',
          name: 'request'
        },
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'TransactionQuote',
          name: 'quote'
        }
      ],
      javaType: 'AFEXDigitalAccount',
      javaCode: `
        DAO accountDAO = (DAO) x.get("localAccountDAO");
        AFEXDigitalAccount account = (AFEXDigitalAccount) accountDAO.find(AND(
          EQ(AFEXDigitalAccount.DENOMINATION, request.getSourceCurrency()),
          INSTANCE_OF(AFEXDigitalAccount.getOwnClassInfo()),
          EQ(AFEXDigitalAccount. OWNER, quote.getRequestOwner())
        ));

        if ( account == null ) {
          account = new AFEXDigitalAccount.Builder(x)
            .setOwner(quote.getRequestOwner())
            .setName(quote.getRequestOwner() + "'s AFEX digital account " + request.getSourceCurrency())
            .setDenomination(request.getSourceCurrency())
            .build();
          account = (AFEXDigitalAccount) accountDAO.put(account);
        }
        return account;
      `
    },
  ]
});
