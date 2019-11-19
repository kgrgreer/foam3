foam.CLASS({
  package: 'net.nanopay.liquidity.rules.approvalRequest',
  name: 'FulfilledAccountApprovalsPredicate',

  documentation: 'Returns true if from the localAccountDAO and the ApprovalStatus is APPROVED',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(DOT(NEW_OBJ, ApprovalRequest.DAO_KEY), "localAccountDAO"),
          EQ(DOT(NEW_OBJ, ApprovalRequest.STATUS), ApprovalStatus.APPROVED)
        ).f(obj);
      `
    } 
  ]
});
