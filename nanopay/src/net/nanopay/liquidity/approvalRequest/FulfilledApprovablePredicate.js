foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'FulfilledApprovablePredicate',

  documentation: 'Returns true if from the localAccountDAO and the ApprovalStatus is APPROVED',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.liquidity.approvalRequest.Approvable',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return
          EQ(DOT(NEW_OBJ, Approvable.STATUS), ApprovalStatus.APPROVED)
        .f(obj);
      `
    } 
  ]
});
