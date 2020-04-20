foam.CLASS({
  package: 'net.nanopay.invoice.ruler',
  name: 'SetProcessingDateRule',

  documentation: `Sets invoice processing date when paymentId is associated to invoices`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
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
          ((Invoice) obj).setProcessingDate(new Date());
        }
      }, "set processing date on invoice");
      `
    }
  ]
});
