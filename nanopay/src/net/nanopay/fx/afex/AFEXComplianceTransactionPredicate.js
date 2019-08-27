foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXComplianceTransactionPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'static foam.mlang.MLang.*',
    'net.nanopay.fx.afex.AFEXBeneficiaryComplianceTransaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      return AND(
        EQ(DOT(NEW_OBJ, INSTANCE_OF(AFEXBeneficiaryComplianceTransaction.class)), true),
        EQ(DOT(NEW_OBJ, AFEXBeneficiaryComplianceTransaction.STATUS), TransactionStatus.PENDING)
      ).f(obj);
      `
    }
  ]
});
