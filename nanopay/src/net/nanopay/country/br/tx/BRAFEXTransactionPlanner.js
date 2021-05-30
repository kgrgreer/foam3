/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.country.br.tx',
  name: 'BRAFEXTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AFEXTransactionPlanner',

  documentation: 'Overrides AFEX planner create trade to fetch the POP code from partner lineitem',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'java.text.DateFormat',
    'java.text.SimpleDateFormat',
    'java.time.LocalDateTime',
    'java.util.ArrayList'
    'java.util.Date',
    'java.util.Date',
    'java.util.Locale',
    'java.util.UUID',
    'net.nanopay.country.br.AFEXPOPCode',
    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.afex.AFEXTransaction',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.ExternalTransfer',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],


  methods: [
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
