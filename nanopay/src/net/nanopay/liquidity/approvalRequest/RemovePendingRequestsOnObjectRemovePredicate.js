foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'RemovePendingRequestsOnObjectRemovePredicate',

  documentation: `
    Returns true from the approvalRequest if an approvableDAO 
    approval request has been APPROVED or REJECTED
  `,

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.nanos.ruler.Operations',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.liquidity.approvalRequest.RoleApprovalRequest',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(DOT(NEW_OBJ, ApprovalRequest.STATUS), ApprovalStatus.APPROVED),
          EQ(DOT(NEW_OBJ, RoleApprovalRequest.OPERATION), Operations.REMOVE)
        ).f(obj);
      `
    } 
  ]
});
