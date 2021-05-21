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
  name: 'InvoiceQuotingRule',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Quote transactions when the invoice has request transaction`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.core.ClientRuntimeException',
    'foam.nanos.logger.Logger',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote'
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: ` 
        agency.submit(x, agencyX -> {
            Invoice invoice = (Invoice) obj;
            TransactionQuote quote = new TransactionQuote();
            DAO transactionPlannerDAO = (DAO) agencyX.get("localTransactionPlannerDAO");

            quote.setRequestTransaction(invoice.getRequestTransaction());

            try {
              quote = (TransactionQuote) transactionPlannerDAO.put(quote);
            } catch(RuntimeException error){
              throw new ClientRuntimeException(error.getMessage(), error);
            }

            invoice.setQuote(quote);
            invoice.setRequestTransaction(null);
        }, "Quote transactions when the invoice has request transaction");
      `
    }
  ]
 });
