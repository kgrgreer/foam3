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
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'ComplianceTransactionApproval',

  documentation: 'Updates compliance transaction according to approval.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestUtil',
    'foam.nanos.approval.ApprovalStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Transaction transaction = (Transaction) obj.fclone();
            DAO dao = ((DAO) x.get("approvalRequestDAO"))
              .where(AND(
                EQ(ApprovalRequest.SERVER_DAO_KEY, "localTransactionDAO"),
                EQ(ApprovalRequest.OBJ_ID, transaction.getId())
              ));

            ApprovalStatus approval = ApprovalRequestUtil.getState(dao);
            if ( approval != null && approval != ApprovalStatus.REQUESTED ) {
              transaction.setStatus(
                ApprovalStatus.APPROVED == approval
                  ? TransactionStatus.COMPLETED
                  : TransactionStatus.DECLINED);
              ((DAO) x.get("localTransactionDAO")).put(transaction);
            }
          }
        }, "Compliance Transaction Approval");
      `
    }
  ]
});
