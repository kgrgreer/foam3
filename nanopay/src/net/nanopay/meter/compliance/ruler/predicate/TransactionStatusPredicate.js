foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'TransactionStatusPredicate',

  documentation: 'Returns true if new object is a transaction with given status property.',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'status',
      class: 'Enum',
      of: 'net.nanopay.tx.model.TransactionStatus'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return EQ(
          DOT(NEW_OBJ, Transaction.STATUS), getStatus()
        ).f(obj);
      `
    }
  ]
});
