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
  name: 'JackieRuleOnCreate',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: `Creates an approval request if a Compliance Transaction is encountered.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.tx.model.Transaction',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        ComplianceTransaction ct = (ComplianceTransaction) obj;
        Transaction headTx = ct;
        while ( ! SafetyUtil.isEmpty(headTx.getParent()) ) {
          headTx = headTx.findParent(x);
        }
        ComplianceApprovalRequest req = new ComplianceApprovalRequest.Builder(x)
          .setDaoKey("localTransactionDAO")
          .setObjId(ct.getId())
          .setGroup("fraud-ops")
          .setDescription("Main Summary txn: "+headTx.getSummary()+" The Id of Summary txn: "+headTx.getId() )
          .setClassification("Validate Transaction Using Jackie Rule")
          .build();

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            requestApproval(x, req);
          }
        }, "Jackie Rule On Create");
      `
    }
  ]
});
