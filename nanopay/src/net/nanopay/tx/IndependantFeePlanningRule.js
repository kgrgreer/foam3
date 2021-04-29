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
  package: 'net.nanopay.tx',
  name: 'IndependantFeePlanningRule',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Create fee transaction for independantTransactionFeeLineitems`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.model.Transaction',
    'java.util.ArrayList'
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: `
        Logger logger = (Logger) x.get("logger");

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {

            Transaction txn = (Transaction) obj;
            FeeSummaryTransaction feeTxn = new FeeSummaryTransaction();
            ArrayList<IndependantTransactionFeeLineItem> lineItems = new ArrayList();
            for ( TransactionLineItem li : txn.getLineItems() ) {
              if ( li instanceof IndependantTransactionFeeLineItem ) {
                lineItems.add((IndependantTransactionFeeLineItem) li);
              }
            }
            feeTxn.setLineItems(lineItems.toArray(new IndependantTransactionFeeLineItem[lineItems.size()]));

            TransactionQuote quote = new TransactionQuote();
            Transaction root = txn.findRoot(x);
            DAO transactionPlannerDAO = (DAO) x.get("localTransactionPlannerDAO");
            DAO transactionDAO = (DAO) x.get("localTransactionDAO");
            quote.setRequestTransaction(feeTxn);

            feeTxn.setSourceAccount(root.getDestinationAccount());
            feeTxn.setSourceCurrency(root.findDestinationAccount(x).getDenomination());
            feeTxn.setPayerId(root.findDestinationAccount(x).getOwner());
            
            try {
              quote = (TransactionQuote) transactionPlannerDAO.put(quote);
            } catch(RuntimeException error){
              // todo
            }

            Transaction feeTxn2 = quote.getPlan();
            feeTxn2.setAssociateTransaction(txn.getId());
            feeTxn2 = (Transaction) transactionDAO.put(quote.getPlan());
            txn.setAssociateTransaction(feeTxn2.getId());
          }
        }, "Create fee transaction for independantTransactionFeeLineitems");
      `
    }
  ]
 });
