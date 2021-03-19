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
  package: 'net.nanopay.fx',
  name: 'FXSummaryTransaction',
  extends: 'net.nanopay.fx.FXTransaction',

  documentation: `Transaction used as a summary to for AFEX BMO transactions`,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.util.SafetyUtil',
    'java.util.List',
    'net.nanopay.integration.ErrorCode',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.ChainSummary',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.PartnerTransaction',
    'net.nanopay.tx.ValueMovementTransaction',
    'static foam.mlang.MLang.EQ'
  ],

  messages: [
    { name: 'DESCRIPTION', message: 'Summary' },
  ],

  implements: [
    'net.nanopay.tx.SummarizingTransaction'
  ],

  sections: [
      {
        name: 'transactionChainSummaryInformation',
        title: 'Transaction Status Summary',
        help: 'Transaction chain information can be added here',
        order: 15
      }
    ],

  properties: [
    {
      name: 'chainSummary',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.ChainSummary',
      storageTransient: true,
      visibility: 'RO',
      section: 'transactionChainSummaryInformation'
    },
    {
      name: 'depositAmount',
      class: 'UnitValue',
      storageTransient: true,
      visibility: 'RO',
      section: 'transactionChainSummaryInformation'
    },
    {
      name: 'withdrawalAmount',
      class: 'UnitValue',
      storageTransient: true,
      visibility: 'RO',
      section: 'transactionChainSummaryInformation'
    },
    {
      class: 'UnitValue',
      name: 'intermediateAmount',
      unitPropName: 'intermediateCurrency',
      section: 'transactionInformation',
      order: 230,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'intermediateCurrency',
      section: 'transactionInformation',
      order: 240,
      gridColumns: 6
    },
    {
      name: 'status',
      value: 'PENDING'
    },
  ],

  methods: [
    {
     documentation: `return true when status change is such that normal (forward) Transfers should be executed (applied)`,
     name: 'canTransfer',
     args: [
       {
         name: 'x',
         type: 'Context'
       },
       {
         name: 'oldTxn',
         type: 'net.nanopay.tx.model.Transaction'
       }
     ],
     type: 'Boolean',
     javaCode: `
       return false;
     `
   },
   {
    documentation: `Collect all line items of succeeding transactions of self.`,
    name: 'collectLineItems',
    javaCode: `
    collectLineItemsFromChain(getNext());
    `
  },
  {
    documentation: `Collect all line items of succeeding transactions of transactions.`,
    name: 'collectLineItemsFromChain',
    args: [
      {
        name: 'transactions',
        type: 'net.nanopay.tx.model.Transaction[]'
      }
    ],
    javaCode: `
    if ( transactions != null ) {
      for ( Transaction transaction : transactions ) {
        addLineItems(transaction.getLineItems());
        collectLineItemsFromChain(transaction.getNext());
      }
    }
    `
  },
  function toSummary() {
    return this.DESCRIPTION;
  },
  {
    documentation: 'Returns childrens status.',
    name: 'calculateTransients',
    args: [
      { name: 'x', type: 'Context' },
      { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
    ],
    javaCode: `
      DAO dao = (DAO) x.get("localTransactionDAO");
      List children = ((ArraySink) dao.where(EQ(Transaction.PARENT, txn.getId())).select(new ArraySink())).getArray();
      for ( Object obj : children ) {
        Transaction child = (Transaction) obj;
        this.calculateTransients(x, child);
        if ( ( ! depositAmountIsSet_) && (child instanceof ValueMovementTransaction) && (SafetyUtil.equals(this.getDestinationAccount(), child.getDestinationAccount())) ){
          this.setDepositAmount(child.getTotal(x, child.getDestinationAccount()));
        }
        if ( ( ! withdrawalAmountIsSet_) && (child instanceof ValueMovementTransaction) && (SafetyUtil.equals(this.getSourceAccount(), child.getSourceAccount())) ){
          this.setWithdrawalAmount(child.getTotal(x, child.getSourceAccount()));
        }
      }

      if (SafetyUtil.equals(txn, this)) {
        Transaction t = this.getStateTxn(x);
        ChainSummary cs = new ChainSummary();
        if (t.getStatus() != TransactionStatus.COMPLETED) {
          cs.setErrorCode(t.calculateErrorCode());
          ErrorCode errorCode = cs.findErrorCode(x);
          if ( errorCode != null ) {
            cs.setErrorInfo(errorCode.getSummary());
          }
        }
        cs.setStatus(t.getStatus());
        cs.setCategory(categorize_(t));
        cs.setSummary(cs.toSummary());
        this.setChainSummary(cs);
      }
    `
  },
  {
    documentation: 'sorts transaction into category, for display to user.',
    name: 'categorize_',
    args: [
      { name: 't', type: 'net.nanopay.tx.model.Transaction' }
    ],
    type: 'String',
    javaCode: `
      if (t.getStatus().equals(TransactionStatus.COMPLETED))
        return "";
      if (t instanceof CITransaction)
        return "CashIn";
      if (t instanceof COTransaction)
        return "CashOut";
      if (t instanceof PartnerTransaction)
        return "Partner";
      if (t instanceof DigitalTransaction)
        return "Digital";
      else
        return "Approval";
    `
  },
 ],
});
