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
  package: 'net.nanopay.tx',
  name: 'ReversalRule',

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
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.ReversalTicket',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          
          ReversalTicket request = (ReversalTicket) obj;
          DAO txnDAO = (DAO) x.get("localTransactionDAO");
          Transaction txn = (Transaction) txnDAO.find(request.getRequestTransaction());
          Transaction problemTxn = txn.getStateTxn(x);
          Transaction newTxn = new Transaction();

          if (! (txn instanceof SummaryTransaction || txn instanceof FXSummaryTransaction) ) {
            txn = txn.findRoot(x);
          }

          if ( request.getRefundTransaction() ) {
            newTxn.setSourceAccount(problemTxn.getDestinationAccount());
            newTxn.setDestinationAccount(txn.getSourceAccount());
            newTxn.setAmount(-problemTxn.getTotal(x, problemTxn.getSourceAccount()));
          } else {
            newTxn.setSourceAccount(problemTxn.getSourceAccount());
            newTxn.setDestinationAccount(txn.getDestinationAccount());
            newTxn.setAmount(-problemTxn.getTotal(x, problemTxn.getSourceAccount()));  
          }
          
          newTxn.setLineItems(request.getLineitems());
          txnDAO.put(newTxn);

        }
     
      }, "Rule to reverse transaction.");
      `
    }
  ]

});
