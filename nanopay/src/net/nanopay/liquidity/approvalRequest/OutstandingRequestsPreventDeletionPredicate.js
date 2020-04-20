/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'OutstandingRequestsPreventDeletionPredicate',

  documentation: `
    Returns true from the approvalRequest if a deletion approval request 
    has been APPROVED
  `,

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.ruler.Operations',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(DOT(NEW_OBJ, ApprovalRequest.STATUS), ApprovalStatus.APPROVED),
          EQ(DOT(NEW_OBJ, ApprovalRequest.OPERATION), Operations.REMOVE)
        ).f(obj);
      `
    } 
  ]
});
