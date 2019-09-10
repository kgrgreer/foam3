foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBusinessApprovalRequestRule',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Creates an approval request when an AFEX Business is created.`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.MLang',
    'static foam.mlang.MLang.*',
    'java.util.List',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: ` 
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            AFEXBusiness afexBusiness = (AFEXBusiness) obj;
            DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
            approvalRequestDAO.put_(x,
              new AFEXBusinessApprovalRequest.Builder(x)
                .setDaoKey("afexBusinessDAO")
                .setObjId(String.valueOf(afexBusiness.getId()))
                .setGroup("payment-ops")
                .setStatus(ApprovalStatus.REQUESTED).build());
          }
        }, "Create AFEXBusiness Approval Request Rule");
      `
    }
  ]
 });
