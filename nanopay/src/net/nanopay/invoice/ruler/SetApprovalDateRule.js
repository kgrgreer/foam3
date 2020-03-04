foam.CLASS({
  package: 'net.nanopay.invoice.ruler',
  name: 'SetApprovalDateRule',

  documentation: `Sets invoice approval date when invoice has been approved`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
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
          invoice.setApprovalDate(new Date());
          try {
            invoiceDAO.put(invoice);
          } catch (Throwable e) {
            ((Logger) x.get("logger")).error("Error updating approval date on invoice: " + invoice.getId());
          }
        }
      }, "set approval date on invoice");
      `
    }
  ]
});
