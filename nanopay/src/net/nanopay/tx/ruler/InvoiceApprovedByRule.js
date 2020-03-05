foam.CLASS({
    package: 'net.nanopay.tx.ruler',
    name: 'InvoiceApprovedByRule',

    documentation: 'Set approved by on invoices',

    implements: [
      'foam.nanos.ruler.RuleAction'
    ],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.nanos.auth.User',
      'net.nanopay.invoice.model.Invoice',
      'net.nanopay.invoice.model.PaymentStatus'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
            ((Invoice) obj).setApprovalDate(new Date());
            ((Invoice) obj).setApprovedBy(((User) x.get("agent")).getId());
        `
      }
    ]
  });
