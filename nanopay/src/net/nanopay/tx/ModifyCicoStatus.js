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

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ModifyCicoStatus',

  documentation: 'Updates Cico status for transaction if status is sent. Rule for transaction.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalStatus',
    'net.nanopay.tx.ExpediteCICOApprovalRequest',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        CITransaction ci = (CITransaction) obj;
        DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
        ExpediteCICOApprovalRequest approvalRequest = (ExpediteCICOApprovalRequest) approvalRequestDAO.find(
          AND(
            EQ(ExpediteCICOApprovalRequest.OBJ_ID, ci.getId()),
            EQ(ExpediteCICOApprovalRequest.SERVER_DAO_KEY, "localTransactionDAO")
          )
        );
        if ( approvalRequest != null
          && ci.getStatus() == TransactionStatus.SENT
          && approvalRequest.getStatus() == ApprovalStatus.APPROVED
        ) {
          ci.setStatus(TransactionStatus.COMPLETED);
        }
      `
    }
  ]
});
