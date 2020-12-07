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
  name: 'CreateExpediteApprovalRequest',
  // Rename extended class to something not related to compliance
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Creates an approval request when a Cico transaction is created',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.tx.ExpediteCICOApprovalRequest',
    'net.nanopay.tx.cico.CITransaction'
  ],

  properties: [
    {
      class: 'String',
      name: 'approverGroupId',
      value: 'payment-ops'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        CITransaction ci = (CITransaction) obj;

        ExpediteCICOApprovalRequest req = new ExpediteCICOApprovalRequest.Builder(x)
          .setObjId(ci.getId())
          .setDescription("Transaction ID: "+ci.getId())
          .setGroup(ci.getSpid() + "-payment-ops")
          .build();

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            requestApproval(x, req);
          }
        }, "Expedite CICO Approval Request On Create");
      `
    }
  ]
});
