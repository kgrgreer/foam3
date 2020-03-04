foam.CLASS({
  package: 'net.nanopay.invoice.ruler',
  name: 'SetProcessingDateRule',

  documentation: `Sets invoice processing date when paymentId is associated to invoices`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.invoice.model.Invoice',

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
          Invoice invoice = (Invoice) obj;
          invoice = (Invoice) invoice.fclone();
          invoice.setProcessingDate(new Date());
          try {
            invoiceDAO.put(invoice);
          } catch (Throwable e) {
            ((Logger) x.get("logger")).error("Error updating processing date on invoice: " + invoice.getId());
          }
        }
      }, "set processing date on invoice");
      `
    }
  ]
});
