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
  name: 'JackieRuleOnPut',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: `Checks if Jackie approved the transaction`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.*',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.core.ClientRuntimeException',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          @Override
          public void execute(X x) {
            ComplianceTransaction ct = (ComplianceTransaction) obj;
            // ((Logger) x.get("logger")).debug("JackieRuleOnPut status IN", ct.getStatus());
              DAO results = ((DAO) getX().get("approvalRequestDAO"))
                .where(
                  AND(
                    EQ(ApprovalRequest.SERVER_DAO_KEY, "localTransactionDAO"),
                    EQ(ApprovalRequest.OBJ_ID, ct.getId())
                  )
                );
    
              if ( ( (Count) results.select(new Count()) ).getValue()  == 0 ) {
                DAO alarmDAO = (DAO) getX().get("alarmDAO");
                
                Alarm alarm = new Alarm();
                alarm.setName("JackieRuleOnPut - Approvals");
                alarm.setReason(AlarmReason.UNSPECIFIED);
                alarm.setNote(
                  "Could not find an approval request for the ComplianceTransaction: " + ct.getId()
                );
                
                throw new ClientRuntimeException("Could not find an approval request for the ComplianceTransaction");
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
          }
        }, "Jackie Rule On Put");
      `
    }
  ]
});
