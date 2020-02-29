foam.CLASS({
  package: 'net.nanopay.invoice.ruler',
  name: 'IsCompletePayment',

  documentation: `Returns true if new object is a invoice with COMPLETED status.`,

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return 
          EQ(DOT(NEW_OBJ, Invoice.STATUS), InvoiceStatus.PAID)
        .f(obj);
      `
    }
  ]
});
