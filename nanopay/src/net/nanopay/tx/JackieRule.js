foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'JackieRule',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: `Creates an approval request if a Compliance Transaction is encountered.`,

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

        if ( obj instanceof ComplianceTransaction ) {
        ComplianceTransaction ct = (ComplianceTransaction) obj;
        if ( ct.getStatus() == TransactionStatus.PENDING ) {
          if ( ( (AppConfig) x.get("appConfig") ).getMode() != Mode.TEST && ( (AppConfig) x.get("appConfig") ).getMode() != Mode.DEVELOPMENT ) {
            DAO results = ((DAO) x.get("approvalRequestsDAO"))
              .where(
                AND(
                  EQ(ApprovalRequest.DAO_KEY, "localTransactionDAO"),
                  EQ(ApprovalRequest.OBJ_ID, ct.getId())
                )
              );

            Count count = new Count();
              count = (Count) results.select(count);
              // If no approvalRequests are found, we need to make some
              if ( count.getValue() == 0 )
                requestApproval(x, ct, "localTransactionDAO");
              //We have received a Rejection and should decline.
              else {
                if ( ( (Count) results.where(
                  EQ(ApprovalRequest.STATUS,ApprovalStatus.REJECTED) ).select(count) ).getValue() > 0 ) {
                    ct.setStatus(TransactionStatus.DECLINED);
                  }

                //We have received an Approval and can continue.
                else if ( ( (Count) results.where(
                  EQ(ApprovalRequest.STATUS,ApprovalStatus.APPROVED) ).select(count) ).getValue() > 0 ) {
                    ct.setStatus(TransactionStatus.COMPLETED);
                  }
              }
            }
            else  {  ct.setStatus(TransactionStatus.COMPLETED); }
            obj = ct;
          }
        }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: ` `
    }
  ]
});
