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
  name: 'RefundTransactionPostRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to refund transaction`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.logger.Logger',
    'net.nanopay.ticket.RefundTicket',
    'net.nanopay.ticket.RefundStatus',
    'net.nanopay.tx.creditengine.FeeRefund',
    'net.nanopay.tx.creditengine.AllFeeWaiver',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.util.ArrayList'
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
          DAO creditCodeDAO = (DAO) x.get("creditCodeDAO");
          request.setRefundStatus(RefundStatus.PROCESSING);

          Transaction reverse = request.getRequestTransaction();
          ArrayList<String> array = new ArrayList<String>();

          // Create Fee Waivers and Refunds
          try {
            if ( request.getFeeLineItemsSelected() != null && request.getFeeLineItemsSelected().length > 0 ) {
              FeeRefund feeRefund = new FeeRefund();
              feeRefund.setTicket(request.getId());
              feeRefund.setName("Fee Refund");
              feeRefund.setSpid(request.getSpid());
              feeRefund.setOwner(request.getOwner());
              feeRefund.setInitialQuantity(1);
              feeRefund.setOfTxn(DigitalTransaction.getOwnClassInfo());
              feeRefund = (FeeRefund) creditCodeDAO.put(feeRefund);
              array.add(feeRefund.getId());
            }

            if ( request.getWaiveCharges() ) {
              AllFeeWaiver feeWaiver = new AllFeeWaiver();
              feeWaiver.setDiscountPercent(1);
              feeWaiver.setName("Fee waiver");
              feeWaiver.setSpid(reverse.getSpid());
              feeWaiver.setOwner(request.getOwner());
              feeWaiver.setInitialQuantity(1);
              feeWaiver = (AllFeeWaiver) creditCodeDAO.put(feeWaiver);
              array.add(feeWaiver.getId());
            }

            if ( array.size() > 0 ) {
              reverse.setCreditCodes(array.toArray(new String[array.size()]));
            }
            // Cancel paused transaction
            Transaction problemTxn = (Transaction) txnDAO.inX(x).find(request.getProblemTransaction()).fclone();
            if ( problemTxn.getStatus() == TransactionStatus.PAUSED ) {
              problemTxn.setStatus(problemTxn.getLastStatus());
              txnDAO.inX(x).put(problemTxn);
              problemTxn.setStatus(TransactionStatus.CANCELLED);
              txnDAO.inX(x).put(problemTxn);
            } else {
              Object [] tobePaused = ((ArraySink) problemTxn.getChildren(x).select(new ArraySink())).getArray().toArray();
              if ( tobePaused.length > 0 ) {
              //TODO: iterate through all children.
                problemTxn = (Transaction) tobePaused[0];
                if ( problemTxn.getStatus() == TransactionStatus.PAUSED ) { // do we want 1 level checking or full walk?
                  problemTxn.setStatus(TransactionStatus.CANCELLED);
                  txnDAO.inX(x).put(problemTxn);
                }
                else {
                  Logger logger = (Logger) x.get("logger");
                  logger.warning("RefundTransactionPostRule, running on ticket "+request.getId()+" No paused transaction to cancel. Rule ran but did not cancel old transaction!");
                  request.setRefundStatus(RefundStatus.FAILED);
                }
              }
            }
            txnDAO.put(reverse);
          }
          catch(Exception e) {
            Logger logger = (Logger) x.get("logger");
            logger.warning("RefundTransactionPostRule, running on ticket "+request.getId()+" encountered problem refunding transaction: "+e);
            request.setRefundStatus(RefundStatus.FAILED);
          }

        }
     
      }, "Post Rule to submit the refunding reverse transaction and cancel old txn.");
      `
    }
  ]

});
