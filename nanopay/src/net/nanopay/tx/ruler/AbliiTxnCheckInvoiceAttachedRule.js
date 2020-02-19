foam.CLASS({
    package: 'net.nanopay.tx.ruler',
    name: 'AbliiTxnCheckInvoiceAttachedRule',

    documentation: 'Check if Ablii transaction has an invoice attached to it.',

    implements: [
      'foam.nanos.ruler.RuleAction'
    ],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.nanos.logger.Logger',
      'net.nanopay.tx.AbliiTransaction'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            AbliiTransaction txn    = (AbliiTransaction) obj;
            if( txn.findInvoiceId(x) == null ) {
                ((Logger) x.get("logger")).error("An invoice was not provided for this transaction");
                throw new RuntimeException("An invoice for this transaction was not provided.");
            }
          }
        }, "Ablii Transaction Check Invoice Attached.");
        `
      }
    ]
  });
