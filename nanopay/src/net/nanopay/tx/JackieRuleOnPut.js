foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'JackieRuleOnPut',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: `Checks if Jackie approved the transaction`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.*',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.model.TransactionStatus',
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        ComplianceTransaction ct = (ComplianceTransaction) obj;
        // ((Logger) x.get("logger")).debug("JackieRuleOnPut status IN", ct.getStatus());
          DAO results = ((DAO) x.get("approvalRequestDAO"))
            .where(
              AND(
                EQ(ApprovalRequest.DAO_KEY, "localTransactionDAO"),
                EQ(ApprovalRequest.OBJ_ID, ct.getId())
              )
            );

          if ( ( (Count) results.select(new Count()) ).getValue()  == 0 ) {
            ((Logger) x.get("logger")).error(this.getClass().getSimpleName(), "No approval was created on put (create).");
            throw new RuntimeException("No approval request was created on put.");
          } else if ( ( (Count) results.where(
            EQ(ApprovalRequest.STATUS,ApprovalStatus.REJECTED) ).select(new Count()) ).getValue() > 0 ) {
            //We have received a Rejection and should decline.
            ct.setStatus(TransactionStatus.DECLINED);
          } else if ( ( (Count) results.where(
            EQ(ApprovalRequest.STATUS,ApprovalStatus.APPROVED) ).select(new Count()) ).getValue() > 0 ) {
            //We have received an Approval and can continue.
            ct.setStatus(TransactionStatus.COMPLETED);
          }
        // ((Logger) x.get("logger")).debug("JackieRuleOnPut status OUT", ct.getStatus());
      `
    }
  ]
});
