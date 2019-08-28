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
            Invoice invoice = (Invoice) obj;
            Invoice oldInvoice = (Invoice) oldObj;
            if (oldInvoice.getPaymentMethod()PaymentStatus.PENDING_APPROVAL &&
                  (invoice.getPaymentMethod()PaymentStatus.PROCESSING ||
                   invoice.getPaymentMethod()PaymentStatus.NANOPAY)) {
              invoice.setApprovedBy(((User) x.get("user")).getId());
            }
        `
      }
    ]
  
  });
