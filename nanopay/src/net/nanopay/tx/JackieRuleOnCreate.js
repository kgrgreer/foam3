foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'JackieRuleOnCreate',
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
          requestApproval(x, obj, "localTransactionDAO");
        }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: ` `
    },
    {
      name: 'describe',
      javaCode: ` return ""; `
    },
    {
      name: 'canExecute',
      javaCode: ` return true;`
    }
  ]
});
