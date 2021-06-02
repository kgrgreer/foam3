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
    'foam.log.LogLevel',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.UUID',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.country.br.tx.PartnerLineItem',
    'net.nanopay.country.br.tx.BRPartnerTransaction',
    'net.nanopay.country.br.NatureCode',
    'net.nanopay.fx.afex.AFEXPOPCode',
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
      BRPartnerTransaction bTx = new BRPartnerTransaction();
      bTx.setLineItems(requestTxn.getLineItems());
      bTx.copyFrom(requestTxn);
      bTx.setId(UUID.randomUUID().toString());
      bTx.setAmount(requestTxn.getAmount());
      bTx.setName("Partner transaction");
      bTx.setPaymentProvider(getPaymentProvider());
      bTx.setPlanner(this.getId());
      addPartnerLineItem(x, bTx, requestTxn);
      quote.addTransfer(false, quote.getDestinationAccount().getId(), bTx.getDestinationAmount(), 0);
      quote.addTransfer(false, quote.getSourceAccount().getId(), -bTx.getAmount(), 0);
      return bTx;
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
        if ( ! ( txn instanceof BRPartnerTransaction ) ) {
          return true;
        }
        BRPartnerTransaction transaction = (BRPartnerTransaction) txn;
        PartnerLineItem pLineItem = null;

        for ( TransactionLineItem lineItem: txn.getLineItems() ) {
          if ( lineItem instanceof PartnerLineItem ) {
            pLineItem = (PartnerLineItem) lineItem;
          }
        }
        if ( pLineItem == null ) throw new ValidationException("[Transaction Validation error] "+ this.MISSING_LINEITEM);

        NatureCode natureCode = (NatureCode) ((DAO) x.get("natureCodeDAO")).inX(x).find(EQ(NatureCode.OPERATION_TYPE, pLineItem.getReasonCode()));
        if ( natureCode == null ) throw new ValidationException("Nature Code doesn't exist: " + pLineItem.getReasonCode());

        var popCode = ((DAO) x.get("afexPOPCodesDAO")).find(AND(
          EQ(AFEXPOPCode.PARTNER_CODE, natureCode.getOperationType()),
          EQ(AFEXPOPCode.COUNTRY_CODE, "BR")
        ));
        if ( popCode == null ) {
          Logger logger = (Logger) x.get("logger");
          logger.error("No mapping found for reasonCode: " + natureCode.getOperationType() + " for AFEX partner");
          Alarm alarm = new Alarm();
          alarm.setClusterable(false);
          alarm.setSeverity(LogLevel.ERROR);
          alarm.setName("Failed to map Nature Code to partner reason code");
          alarm.setNote("No reason code found for Nature Code: " + natureCode.getOperationType() + " for AFEX partner");
          alarm = (Alarm) ((DAO) x.get("alarmDAO")).put(alarm);
          throw new ValidationException("Nature Code doesn't match any partner reason code");
        }

        return true;
      `
    },
    {
      name: 'addPartnerLineItem',
      type: 'BRPartnerTransaction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'txn',
          type: 'BRPartnerTransaction',
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
