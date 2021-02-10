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
  package: 'net.nanopay.ticket',
  name: 'RefundRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to refund transaction`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.fs.File',
    'foam.nanos.notification.Notification',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.ticket.RefundTicket',
    'net.nanopay.ticket.RefundStatus',
    'net.nanopay.tx.CreditLineItem',
    'net.nanopay.tx.FeeSummaryTransactionLineItem',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.util.ArrayList',
    
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.CLASS_OF',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          
          RefundTicket request = (RefundTicket) obj;
          DAO txnDAO = (DAO) x.get("localTransactionDAO");
          Transaction txn = (Transaction) txnDAO.inX(x).find(request.getRequestTransaction());
          Transaction newTxn = new Transaction();

          if (! (txn instanceof SummaryTransaction || txn instanceof FXSummaryTransaction) ) {
            txn = txn.findRoot(x);
          }

          Transaction problemTxn = txn.getStateTxn(x);
          problemTxn = (Transaction) problemTxn.fclone();
          ArrayList<TransactionLineItem> array = new ArrayList<>();
          DAO dao = (DAO) x.get("localAccountDAO");
          DigitalAccount digitalAccount = (DigitalAccount) dao.find(AND(
              EQ(Account.OWNER, txn.findSourceAccount(x).getOwner()),
              CLASS_OF(DigitalAccount.class)
            ));

          if ( request.getRefundOldFees() ) {
            FeeSummaryTransactionLineItem feeSummary = null;
            for ( TransactionLineItem lineItem: txn.getLineItems() ) {
              if ( lineItem instanceof FeeSummaryTransactionLineItem ) {
                feeSummary = (FeeSummaryTransactionLineItem) lineItem;
              }
            }
            CreditLineItem feeRefund = new CreditLineItem();
            feeRefund.setAmount(feeSummary.getAmount());
            feeRefund.setFeeCurrency(feeSummary.getCurrency());
            // TODO replace with credit account
            feeRefund.setSourceAccount("6028f910-9f66-4cc3-a4cd-f5790ca3eafa");
            feeRefund.setDestinationAccount(digitalAccount.getId());
            array.add(feeRefund);
          }

          if ( request.getCreditAmount() > 0 ) {
            CreditLineItem feeRefund = new CreditLineItem();
            feeRefund.setAmount(request.getCreditAmount());
            feeRefund.setFeeCurrency(txn.findSourceAccount(x).getDenomination());
            // TODO replace with credit account
            feeRefund.setSourceAccount("6028f910-9f66-4cc3-a4cd-f5790ca3eafa");
            feeRefund.setDestinationAccount(digitalAccount.getId());
            array.add(feeRefund);
          }

          newTxn.setSourceAccount(problemTxn.getSourceAccount());
          newTxn.setDestinationAccount(txn.getSourceAccount());
          newTxn.setAmount(txn.getAmount());
          if ( array.size() > 0 ) {
            newTxn.setLineItems(array.toArray(new TransactionLineItem[array.size()]));
          }

          problemTxn.setStatus(TransactionStatus.CANCELLED);
          txnDAO.inX(x).put(problemTxn);
          txnDAO.inX(x).put(newTxn);

          request.setRefundStatus(RefundStatus.PROCESSING);
        }
     
      }, "Rule to reverse transaction.");
      `
    }
  ]

});
