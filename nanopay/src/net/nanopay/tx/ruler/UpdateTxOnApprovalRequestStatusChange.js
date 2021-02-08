/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.tx.ruler',
  name: 'UpdateTxOnApprovalRequestStatusChange',

  documentation: `An action that updates compliance transaction to COMPLETED if request is approved
    or DECLINED if request is declined`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.Currency',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.util.SafetyUtil',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
         agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              ApprovalRequest request = (ApprovalRequest) obj;
              ApprovalRequest oldRequest = (ApprovalRequest) oldObj;
              if ( oldRequest.getStatus() == ApprovalStatus.APPROVED ||
                oldRequest.getStatus() == ApprovalStatus.REJECTED ) return;
              DAO txDAO = ((DAO) x.get("transactionDAO"));
              Transaction tx = (Transaction) txDAO.find(request.getObjId());
              if ( request.getStatus() == ApprovalStatus.APPROVED ) {
                tx.setStatus(TransactionStatus.COMPLETED);
              } else if ( request.getStatus() == ApprovalStatus.REJECTED ) {
                tx.setStatus(TransactionStatus.DECLINED);
              }
              txDAO.put(tx);
            }
         },"Update Transaction Status On Approval Request");
      `
    }
  ]
});
