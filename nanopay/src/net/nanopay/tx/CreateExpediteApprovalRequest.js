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
