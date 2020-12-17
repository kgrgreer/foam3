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
  name: 'SetReceivedDateRule',

  documentation: `Sets invoice payment received date when CO transaction is settled.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.tx.model.Transaction',

    'java.util.Date'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          DAO invoiceDAO = (DAO) x.get("invoiceDAO");
          Transaction transaction = (Transaction) obj;
          Invoice invoice = (Invoice) invoiceDAO.find(transaction.getInvoiceId());

          try {
            invoice.setPaymentReceivedDate(new Date());
            invoiceDAO.put(invoice);
          } catch (Throwable e) {
            ((Logger) x.get("logger")).error("Payment received date was not updated on invoice: ", invoice.getId(), " Error: ", e);
          }
        }
      }, "set payment received date on invoice");
      `
    }
  ]
});
