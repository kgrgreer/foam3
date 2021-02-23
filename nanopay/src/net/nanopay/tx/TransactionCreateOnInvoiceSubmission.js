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
  name: 'TransactionCreateOnInvoiceSubmission',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Quote and submit transactions when the invoice has processPaymentOnCreate true`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.tx.model.Transaction'
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: ` 
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {

            //TODO: Add check for lifecycles if invoice adds lifeCycle support

            Invoice invoice = (Invoice) obj;
            Transaction requestTxn = new Transaction();
            TransactionQuote quote = new TransactionQuote();
            DAO transactionDAO = (DAO) x.get("localTransactionDAO");
            DAO transactionPlannerDAO = (DAO) x.get("localTransactionPlannerDAO");

            invoice.setProcessPaymentOnCreate(false);

            requestTxn.setSourceAccount(invoice.getAccount());
            requestTxn.setDestinationAccount(invoice.getDestinationAccount());
            requestTxn.setSourceCurrency(invoice.getSourceCurrency());
            requestTxn.setDestinationCurrency(invoice.getDestinationCurrency());
            requestTxn.setPayerId(invoice.getPayerId());
            requestTxn.setPayeeId(invoice.getPayeeId());
            requestTxn.setDestinationAmount(invoice.getAmount());
            requestTxn.setLineItems(invoice.getTransactionLineItems());

            quote.setRequestTransaction(requestTxn);
            try {
              quote = (TransactionQuote) transactionPlannerDAO.put(quote);

              TransactionLineItem[] lineItems = quote.getPlan().getLineItems();
              for( int i=0; i < lineItems.length; i++ ) {
                if ( lineItems[i].getRequiresUserInput() ) {
                  lineItems[i].validate(x);
                }
              }
              
              transactionDAO.put(quote.getPlan());
              invoice.setPaymentMethod(PaymentStatus.PROCESSING);
            } catch (Exception e) {
              invoice.setPaymentMethod(PaymentStatus.VOID);
            }

          }
        }, "Quote and submit transactions when the invoice has processPaymentOnCreate true");
      `
    }
  ]
 });
