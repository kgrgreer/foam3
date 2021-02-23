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
  package: 'net.nanopay.invoice.ruler',
  name: 'InvoiceTransactionSubmitRule',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Submit transactions when the invoice has status quoted and a paymentId`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.tx.ExpiredTransactionException',
    'net.nanopay.tx.model.Transaction'
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: ` 
        Logger logger = (Logger) x.get("logger");

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {

            Invoice invoice = (Invoice) obj;
            DAO transactionDAO = (DAO) x.get("localTransactionDAO");

            try {
              Transaction txn = (Transaction) transactionDAO.put(invoice.getPlan());
              invoice.setPaymentId(txn.getId());
              invoice.setPaymentMethod(PaymentStatus.PROCESSING);
              invoice.clearPlan();
            } catch (Exception e) {
              logger.log("Could not reput transaction on invoice #" + invoice.getId());
              logger.log(e);

              if ( e instanceof ExpiredTransactionException ) {
                throw e;
              }

              invoice.setPaymentMethod(PaymentStatus.SUBMIT);
              invoice.setPaymentId("");
              invoice.clearPlan();
            }

          }
        }, "Submit transactions when the invoice has status quoted and paymentId");
      `
    }
  ]
 });
