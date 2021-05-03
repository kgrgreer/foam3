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
    'foam.i18n.TranslationService',
    'foam.util.SafetyUtil',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionApprovalRequest'
  ],

  messages: [
    { name: 'SUMMARY_TRANSACTION', message: '  Summary Transaction Id: ' }
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
        User owner = ct.findSourceAccount(x).findOwner(x);
        String spid = owner.getSpid();
        String group = spid + "-fraud-ops";

        Subject subject = (Subject) x.get("subject");
        String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();
        TranslationService ts = (TranslationService) x.get("translationService");
        String summaryTx = ts.getTranslation(locale, getClassInfo().getId() + ".SUMMARY_TRANSACTION", SUMMARY_TRANSACTION);

        TransactionApprovalRequest req = new TransactionApprovalRequest.Builder(x)
          .setDaoKey("transactionDAO")
          .setServerDaoKey("localTransactionDAO")
          .setObjId(ct.getId())
          .setGroup(group)
          .setCreatedFor(owner.getId())
          .setDescription(headTx.getSummary() + summaryTx + headTx.getId())
          .setClassificationEnum(ApprovalRequestClassificationEnum.TRANSACTION_REQUEST)
          .setPaymentId(headTx.getId())
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
