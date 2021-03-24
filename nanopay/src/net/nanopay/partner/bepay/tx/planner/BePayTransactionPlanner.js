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
  package: 'net.nanopay.partner.bepay.tx.planner',
  name: 'BePayTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Plans BRL to intermediary currencies e.g. USD, CAD, EUR, and GBP',

  javaImports: [
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.UUID',
    'net.nanopay.country.br.tx.NatureCodeLineItem',
    'net.nanopay.fx.ExchangeRateService',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.partner.bepay.tx.BePayTransaction',
    'net.nanopay.tx.ExternalTransfer',
    'net.nanopay.tx.InfoLineItem',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.InvoicedFeeLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.*',
  ],

  properties: [
    {
      name: 'bestPlan',
      value: true
    },
    {
      name: 'termsAndConditions',
      class: 'String',
      documentation: 'Terms and conditions added to the bepay transaction'
    }
  ],

  messages: [
    {
      name: 'INVALID_NATURE_CODE',
      message: 'Invalid nature code',
    }
  ],

  constants: [
    {
      name: 'PAYMENT_PROVIDER',
      type: 'String',
      value: 'BePay'
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
      //TODO: add api call to retrieve fx rate

      ExchangeRateService exchangeRateService = (ExchangeRateService) x.get("exchangeRateService");

      Double fxRate = exchangeRateService.getRate(requestTxn.getDestinationCurrency(), requestTxn.getSourceCurrency());
      FXSummaryTransaction txn = new FXSummaryTransaction();
      txn.copyFrom(requestTxn);
      txn.setPaymentProvider(PAYMENT_PROVIDER);
      txn.setStatus(TransactionStatus.COMPLETED);
      txn.clearLineItems();
      txn.setAmount( (long) (requestTxn.getDestinationAmount() * fxRate) ); // if rate is in different format, need / here instead of *
      BePayTransaction bTx = new BePayTransaction();
      bTx.setLineItems(requestTxn.getLineItems());
      bTx.copyFrom(requestTxn);
      bTx.setId(UUID.randomUUID().toString());
      bTx.setAmount(txn.getAmount());
      bTx.setName("BePay transaction");
      bTx.setPaymentProvider(PAYMENT_PROVIDER);
      bTx.setPlanner(this.getId());
      txn.addNext(bTx);
      ExternalTransfer[] exT = new ExternalTransfer[2];
      exT[0] = new ExternalTransfer(quote.getDestinationAccount().getId(), bTx.getDestinationAmount());
      exT[1] = new ExternalTransfer(quote.getSourceAccount().getId(), -bTx.getAmount());
      bTx.setTransfers( exT );
      return txn;
    `
    },
    {
      name: 'postPlanning',
      javaCode: `
        return super.postPlanning(x,txn,root);
      `
    },
    {
      name: 'createFeeTransfers',
      javaCode: `
        TransactionLineItem [] ls = txn.getLineItems();
        for ( TransactionLineItem li : ls ) {
          if ( li instanceof FeeLineItem && ! (li instanceof InvoicedFeeLineItem) ) {
            FeeLineItem feeLineItem = (FeeLineItem) li;
            ExternalTransfer ext = new ExternalTransfer(feeLineItem.getSourceAccount(), -feeLineItem.getAmount());
            ExternalTransfer ext2 = new ExternalTransfer(feeLineItem.getDestinationAccount(), feeLineItem.getAmount());
            Transfer[] transfers = { ext, ext2 };
            txn.add(transfers);
          }
        }
        return txn;
      `
    }
  ]
});
