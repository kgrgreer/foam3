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
  name: 'PartnerTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Plans BRL to intermediary currencies e.g. USD, CAD, EUR, and GBP',

  javaImports: [
    'foam.core.ValidationException',
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.UUID',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.country.br.tx.PartnerLineItem',
    'net.nanopay.country.br.tx.PartnerTransaction',
    'net.nanopay.tx.ExternalTransfer',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.InfoLineItem',
    'net.nanopay.tx.InvoicedFeeLineItem',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.*'
  ],

  messages: [
    {
      name: 'MISSING_LINEITEM',
      message: 'Missing PartnerLineItem'
    }
  ],

  properties: [
    {
      name: 'bestPlan',
      value: true
    },
    {
      name: 'paymentProvider',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
      FXSummaryTransaction txn = new FXSummaryTransaction();
      txn.copyFrom(requestTxn);
      txn.setPaymentProvider(getPaymentProvider());
      txn.setStatus(TransactionStatus.COMPLETED);
      txn.clearLineItems();
      PartnerTransaction bTx = new PartnerTransaction();
      bTx.setLineItems(requestTxn.getLineItems());
      bTx.copyFrom(requestTxn);
      bTx.setId(UUID.randomUUID().toString());
      bTx.setAmount(txn.getAmount());
      bTx.setName("Partner transaction");
      bTx.setPaymentProvider(getPaymentProvider());
      bTx.setPlanner(this.getId());
      addPartnerLineItem(x, bTx, requestTxn);
      txn.addNext(bTx);
      ExternalTransfer[] exT = new ExternalTransfer[2];
      exT[0] = new ExternalTransfer(quote.getDestinationAccount().getId(), bTx.getDestinationAmount());
      exT[1] = new ExternalTransfer(quote.getSourceAccount().getId(), -bTx.getAmount());
      bTx.setTransfers( exT );
      return txn;
    `
    },
    {
      name: 'validatePlan',
      type: 'boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        if ( ! ( txn instanceof PartnerTransaction ) ) {
          return true;
        }
        PartnerTransaction transaction = (PartnerTransaction) txn;

        for ( TransactionLineItem lineItem: txn.getLineItems() ) {
          if ( lineItem instanceof PartnerLineItem ) {
            return true;
          }
        }
        throw new ValidationException("[Transaction Validation error] "+ this.MISSING_LINEITEM);
      `
    },
    {
      name: 'addPartnerLineItem',
      javaType: 'PartnerTransaction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'txn',
          type: 'PartnerTransaction',
        },
        {
          name: 'requestTxn',
          type: 'Transaction'
        }
      ],
      javaCode: `
      // Review: we can stop execution here if no PartnerLineItem provided but exception would be "Unable to plan"
      for (TransactionLineItem lineItem: requestTxn.getLineItems() ) {
        if ( lineItem instanceof PartnerLineItem ) {
          txn.addLineItems( new TransactionLineItem[] { lineItem } );
          break;
        }
      }
      return txn;
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
