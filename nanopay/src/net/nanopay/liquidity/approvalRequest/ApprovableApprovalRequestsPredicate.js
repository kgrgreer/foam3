foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'ApprovableApprovalRequestsPredicate',

  documentation: `
    Returns true from the approvalRequest if an approvableDAO 
    approval request has been APPROVED or REJECTED
  `,

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
          EQ(DOT(NEW_OBJ, ApprovalRequest.DAO_KEY), "approvableDAO"),
          OR(
            EQ(DOT(NEW_OBJ, ApprovalRequest.STATUS), ApprovalStatus.APPROVED),
            EQ(DOT(NEW_OBJ, ApprovalRequest.STATUS), ApprovalStatus.REJECTED)
          )
        ).f(obj);
      `
    } 
  ]
});
