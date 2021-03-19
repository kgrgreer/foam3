/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'OutstandingRequestsPreventDeletionRule',

  documentation: `
    A rule to update the approvable once it's related approval request has been
    APPROVED or REJECTED
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.logger.Logger',
    'foam.nanos.dao.Operation',
    'foam.mlang.sink.Count',
    'foam.mlang.MLang',
    'foam.mlang.MLang.*',
    'foam.util.SafetyUtil'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Logger logger = (Logger) x.get("logger");

        ApprovalRequest request = (ApprovalRequest) obj.fclone();

        DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
        DAO approvableDAO = (DAO) x.get("approvableDAO");

        // 1. To account for both transaction and account create requests where outgoing account is the removed object
        if ( SafetyUtil.equals(request.getDaoKey(),"localAccountDAO") ){
          Long numberOfAccountRelatedCreateApprovals = (Long) ((Count) approvalRequestDAO.where(
            MLang.AND(
              MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED),
              MLang.EQ(AccountRoleApprovalRequest.OUTGOING_ACCOUNT, request.getObjId()),
              MLang.EQ(ApprovalRequest.OPERATION, Operation.CREATE)
            )
          ).select(MLang.COUNT())).getValue();

          if ( numberOfAccountRelatedCreateApprovals > 0 ){
            logger.error("Cannot approve this deletion as there is(are) still " + numberOfAccountRelatedCreateApprovals.toString() + " related outstanding request(s).");
            throw new RuntimeException("Cannot approve this deletion as there is(are) still " + numberOfAccountRelatedCreateApprovals.toString() + " related outstanding request(s).");
          }
        }

        // 2. Handling general case
        Long numberOfObjectRelatedApprovals = (Long) ((Count) approvalRequestDAO.where(
          MLang.AND(
            MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED),
            MLang.EQ(ApprovalRequest.DAO_KEY, request.getDaoKey()),
            MLang.EQ(ApprovalRequest.OBJ_ID, request.getObjId()),
            MLang.NOT(
              MLang.EQ(ApprovalRequest.OPERATION, Operation.REMOVE)
            )
          )
        ).select(MLang.COUNT())).getValue();
        
        if ( numberOfObjectRelatedApprovals > 0 ){
          logger.error("Cannot approve this deletion as there is(are) still " + numberOfObjectRelatedApprovals.toString() + " related outstanding request(s).");
          throw new RuntimeException("Cannot approve this deletion as there is(are) still " + numberOfObjectRelatedApprovals.toString() + " related outstanding request(s).");
        }

        // 3. Handle approvable
        Long numberOfObjectRelatedApprovableApprovals = (Long) ((Count) approvableDAO.where(
          MLang.AND(
            MLang.EQ(Approvable.DAO_KEY, request.getDaoKey()),
            MLang.EQ(Approvable.OBJ_ID, request.getObjId()),
            MLang.EQ(Approvable.STATUS, ApprovalStatus.REQUESTED)
          )
        ).select(MLang.COUNT())).getValue();
        
        if ( numberOfObjectRelatedApprovableApprovals > 0 ){
          logger.error("Cannot approve this deletion as there is(are) still " + numberOfObjectRelatedApprovableApprovals.toString() + " related outstanding request(s).");
          throw new RuntimeException("Cannot approve this deletion as there is(are) still " + numberOfObjectRelatedApprovableApprovals.toString() + " related outstanding request(s).");
        }
      `
    }
  ]
});
