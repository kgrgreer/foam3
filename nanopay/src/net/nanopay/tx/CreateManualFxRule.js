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
  name: 'CreateManualFxRule',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Creates an approval request when a kotakFxTransaction is created.`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.*',
    'foam.nanos.approval.ApprovalStatus',
    'net.nanopay.fx.KotakFxTransaction',
    'net.nanopay.fx.ManualFxApprovalRequest'
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            KotakFxTransaction kotakFxTransaction = (KotakFxTransaction) obj;
            DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");

            User owner = kotakFxTransaction.findSourceAccount(x).findOwner(x);

            approvalRequestDAO.put_(x,
              new ManualFxApprovalRequest.Builder(x)
                .setClassificationEnum(ApprovalRequestClassificationEnum.KOTAK_MANUAL_FX_COMPLETED)
                .setDescription("Kotak Manul FX transfer is comlpeted")
                .setDaoKey("transactionDAO")
                .setObjId(kotakFxTransaction.getId())
                .setGroup(kotakFxTransaction.getSpid() + "-payment-ops")
                .setCreatedFor(owner.getId())
                .setStatus(ApprovalStatus.REQUESTED).build());
          }
        }, "Create Manual FX Rule");
      `
    }
  ]
 });
