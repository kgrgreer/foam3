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
    'java.time.LocalDateTime',
    'java.util.Date',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.fx.CurrencyFXService',
    'net.nanopay.fx.afex.AFEXBeneficiaryComplianceTransaction',
    'net.nanopay.fx.afex.AFEXUser',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'net.nanopay.fx.afex.AFEXTransaction',
    'net.nanopay.fx.afex.AFEXFundingTransaction',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.ExternalTransfer',
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
    'net.nanopay.tx.UnsupportedDateException',
    'net.nanopay.country.br.AFEXPOPCode',
    'net.nanopay.country.br.tx.PartnerLineItem',
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
        documentation: 'Split out of plan, to have ability to pass mock service in for testing.',
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
        Logger logger = (Logger) x.get("logger");
        logger.debug(this.getClass().getSimpleName(), "generateTransaction", quote);

        //--- Fetch FX rate and build a transaction chain with it ---
        try {
          return buildChain(quote, x, afexService);
        }
        catch (Throwable t) {
          logger.error("error fetching afex fxQuote", t);
          String message = "Unable to get FX quotes for source currency: "+ request.getSourceCurrency() + " and destination currency: " + request.getDestinationCurrency() + " from AFEX" ;
          Notification notification = new Notification.Builder(x)
            .setTemplate("NOC")
            .setBody(message)
            .build();
          ((DAO) x.get("localNotificationDAO")).put(notification);
          logger.error("Error sending GetQuote to AFEX.", t);
        }
        return null;
      `
    },
    {
      name: 'buildChain',
      args: [
        {
          type: 'TransactionQuote',
          name: 'txnQuote'
        },
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'AFEXServiceProvider',
          name: 'afexService'
        }
      ],
      javaType: 'FXSummaryTransaction',
      javaCode: `

        Transaction request = txnQuote.getRequestTransaction();
        FXQuote fxQuote = new FXQuote.Builder(x).build();
        Long owner = txnQuote.getRequestOwner() != 0 ? txnQuote.getRequestOwner(): txnQuote.getSourceAccount().getOwner();
        AFEXTransaction afexTransaction = null;
        int result = 0;
        String sourceAccountId =  request.getSourceAccount();
        AFEXDigitalAccount afexDigital = null;
        if ( txnQuote.getParent() != null ) { //this is not standalone txn
          afexDigital = findAFEXDigitalAccount(request, x, txnQuote);
          sourceAccountId = afexDigital.getId();
        }

        // --- Plan AFEXTransaction first as it might take multiple quotes to find a working one ---
        try {
          fxQuote = afexService.getFXRate(request.getSourceCurrency(), request.getDestinationCurrency(), request.getAmount(), request.getDestinationAmount(), null, "CASH", owner, null);
          afexTransaction = createAFEXTransaction(x, request, fxQuote, sourceAccountId);
          result = afexService.createTrade(afexTransaction);
          afexTransaction.setAfexTradeResponseNumber(result);
        } catch (UnsupportedDateException e) {
          try {
            fxQuote = afexService.getFXRate(request.getSourceCurrency(), request.getDestinationCurrency(), request.getAmount(), request.getDestinationAmount(), null, "TOM", owner, null);
            afexTransaction = createAFEXTransaction(x, request, fxQuote, sourceAccountId);
            result = afexService.createTrade(afexTransaction);
            afexTransaction.setAfexTradeResponseNumber(result);
          } catch (UnsupportedDateException e2) {
            fxQuote = afexService.getFXRate(request.getSourceCurrency(), request.getDestinationCurrency(), request.getAmount(), request.getDestinationAmount(), null, "SPOT", owner, null);
            afexTransaction = createAFEXTransaction(x, request, fxQuote, sourceAccountId);
            result = afexService.createTrade(afexTransaction);
            afexTransaction.setAfexTradeResponseNumber(result);
          }
        }

        // --- Create AFEXBeneficiaryComplianceTransaction ---
        AFEXBeneficiaryComplianceTransaction afexCT = new AFEXBeneficiaryComplianceTransaction();
        afexCT.copyFrom(request);
        afexCT.setAmount(1);
        afexCT.setId(UUID.randomUUID().toString());
        afexCT.setDestinationAmount(request.getDestinationAmount());
        afexCT.setSourceCurrency(request.getSourceCurrency());
        afexCT.setDestinationCurrency(request.getDestinationCurrency());
        afexCT.setSourceAccount(txnQuote.getSourceAccount().getId());
        afexCT.setDestinationAccount(txnQuote.getDestinationAccount().getId());
        afexCT.setInvoiceId(request.getInvoiceId()); // should this not be already copied?
        afexCT.setPayeeId(request.getPayeeId());
        afexCT.setPayerId(request.getPayerId());
        afexCT.setPlanner(this.getId());

        if ( txnQuote.getParent() != null ) { //this is not standalone txn
          afexCT.setSourceAccount(afexDigital.getId());
          afexCT.addNext( createFundingTransaction(x, request, fxQuote, afexDigital.getId()) );
          afexCT.addNext(afexTransaction);
        }
        else {
          afexCT.addNext( afexTransaction );
        }
        afexCT.setAmount(afexCT.getNext()[0].getAmount());
        //--- Create Fx Summary ---
        FXSummaryTransaction summary = new FXSummaryTransaction();
        // get Summary amounts from the fxQuote
        summary.setAmount(fxQuote.getSourceAmount());
        summary.setDestinationAmount(fxQuote.getTargetAmount());
        summary.setSourceCurrency(request.getSourceCurrency());
        summary.setDestinationCurrency(request.getDestinationCurrency());
        summary.setFxQuoteId(String.valueOf(fxQuote.getId()));
        summary.setSourceAccount(txnQuote.getSourceAccount().getId());
        summary.setDestinationAccount(txnQuote.getDestinationAccount().getId());
        summary.setFxRate(fxQuote.getRate());
        summary.setFxExpiry(fxQuote.getExpiryTime());
        summary.setInvoiceId(request.getInvoiceId());
        summary.setPlanner(this.getId());

        summary.addNext(createComplianceTransaction(request));
        summary.addNext(afexCT);
        return summary;
      `
    },
    {
      name: 'createFundingTransaction',
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
          type: 'String',
          name: 'destination'
        }
      ],
      javaType: 'AFEXFundingTransaction',
      javaCode: `
        AFEXFundingTransaction fundingTransaction = new AFEXFundingTransaction();

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
        fundingTransaction.setDestinationAccount(destination);
        // FundingTransaction does not perform fx conversions, only moves funds to a digital account
        fundingTransaction.setDestinationAmount(fxQuote.getSourceAmount());
        fundingTransaction.setDestinationCurrency(fxQuote.getSourceCurrency());
        fundingTransaction.setPlanner(this.getId());
        fundingTransaction.setValueDate(fxQuote.getValueDate());
        fundingTransaction.clearLineItems();

        ExternalTransfer[] exT = new ExternalTransfer[2];
        exT[0] = new ExternalTransfer( fundingTransaction.getSourceAccount(), -fundingTransaction.getAmount() );
        exT[1] = new ExternalTransfer( fundingTransaction.getDestinationAccount(), fundingTransaction.getDestinationAmount() );
        fundingTransaction.setTransfers( exT );

        return fundingTransaction;
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
          type: 'String',
          name: 'source'
        }
      ],
      javaType: 'AFEXTransaction',
      javaCode: `
        ArrayList<TransactionLineItem> lines = new ArrayList<TransactionLineItem>();
        AFEXTransaction afexTransaction = new AFEXTransaction();
        afexTransaction.copyFrom(request); // why copy if we overwrite almost everything? source/dest accounts?
        afexTransaction.setId(UUID.randomUUID().toString());
        afexTransaction.setStatus(TransactionStatus.PENDING);
        afexTransaction.setName("Foreign Exchange");

        // Since we book the trade right away it won't expire
        LocalDateTime expiry = LocalDateTime.now();
        expiry = expiry.plusHours(24);
        Date exp = java.util.Date.from(expiry.atZone(java.time.ZoneId.systemDefault()).toInstant());

        //--- Set FX Information ---
        afexTransaction.setFxExpiry(fxQuote.getExpiryTime());
        afexTransaction.setFxQuoteId(String.valueOf(fxQuote.getId()));
        afexTransaction.setFxRate(fxQuote.getRate());
        FXLineItem fxl = new FXLineItem.Builder(x)
          .setName("AFEX")
          .setGroup("fx")
          .setRate(fxQuote.getRate())
          .setQuoteId(String.valueOf(fxQuote.getId())).setExpiry(fxQuote.getExpiryTime())
          .setAccepted(ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()))
          .setSourceCurrency(fxQuote.getSourceCurrency())
          .setDestinationCurrency(fxQuote.getTargetCurrency())
          .setExpiry(exp)
          .build();
        lines.add(fxl);
        afexTransaction.setFxExpiry(exp);
        afexTransaction.setPaymentProvider(PAYMENT_PROVIDER);
        if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()))
          afexTransaction.setAccepted(true);

        //--- Set Transaction details ---
        afexTransaction.setAmount(fxQuote.getSourceAmount());
        afexTransaction.setSourceCurrency(fxQuote.getSourceCurrency());
        afexTransaction.setDestinationAmount(fxQuote.getTargetAmount());
        afexTransaction.setDestinationCurrency(fxQuote.getTargetCurrency());
        afexTransaction.setPlanner(this.getId());
        afexTransaction.setSourceAccount(source); // Source could be afex digital, or bank account.
        afexTransaction.setDestinationAccount(request.getDestinationAccount());
        afexTransaction.setInvoiceId(request.getInvoiceId()); // should this not be already copied?
        var popCode = findPOPCode(request, x);
        if ( popCode != null ) afexTransaction.setPOPCode(popCode);

        ExternalTransfer[] exT = new ExternalTransfer[2];
        exT[0] = new ExternalTransfer( afexTransaction.getSourceAccount(), -afexTransaction.getAmount() );
        exT[1] = new ExternalTransfer( afexTransaction.getDestinationAccount(), afexTransaction.getDestinationAmount() );
        afexTransaction.setTransfers( exT );

        //--- Find completion date estimate ---
        Date date = null;
        try{
          DateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.ENGLISH);
          date = format.parse(fxQuote.getValueDate());
        } catch ( Exception e) { /* throw dateParse Exception?*/ }

        if ( date != null ) {
          if (date.getTime() < new Date().getTime()) {
            lines.add(new ETALineItem.Builder(x).setGroup("fx").setEta(0L).build());
          } else {
            lines.add(new ETALineItem.Builder(x).setGroup("fx").setEta(date.getTime() - new Date().getTime()).build());
          }
        }

        afexTransaction.addLineItems( lines.toArray(new TransactionLineItem[0]));

        return afexTransaction;
      `
    },
    {
      name: 'findAFEXDigitalAccount',
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
    {
      name: 'findPOPCode',
      args: [
        {
          type: 'Transaction',
          name: 'request'
        },
        {
          type: 'Context',
          name: 'x'
        }
      ],
      javaType: 'String',
      javaCode: `
        for ( TransactionLineItem lineItem : request.getLineItems() ) {
          if ( lineItem instanceof PartnerLineItem ) {
            String natureCode = ((PartnerLineItem) lineItem).getNatureCode();
            var popCode = ((DAO) x.get("afexPOPCodesDAO")).find(EQ(AFEXPOPCode.NATURE_CODE, natureCode));
            return popCode == null ? null : ((AFEXPOPCode) popCode).getAfexCode();
          }
        }
        return null;
      `
    }
  ]
});
