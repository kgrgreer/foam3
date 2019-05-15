  foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'BusinessFinalRuleValidation',

  documentation: 'Sets a businesses compliance to passed if not otherwise marked by preceding compliance checks.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.ruler.RuleHistory',
    'foam.nanos.ruler.Rule',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Business business = (Business) obj;
        DAO ruleHistoryDAO = (DAO) x.get("ruleHistoryDAO");

        ArraySink sink = (ArraySink) ruleHistoryDAO.where(
          AND(
            EQ(RuleHistory.OBJECT_ID, business.getId()),
            EQ(RuleHistory.OBJECT_DAO_KEY, "localUserDAO"),
            EQ(RuleHistory.RULE_ID, 1301)
          )
        ).orderBy(DESC(RuleHistory.CREATED)).limit(1).select(new ArraySink());

        RuleHistory previousExecution = (RuleHistory) sink.getArray().get(0);

        RuleHistory failedRuleHistory = (RuleHistory) ruleHistoryDAO.find(
          AND(
            EQ(RuleHistory.OBJECT_ID, business.getId()),
            EQ(RuleHistory.OBJECT_DAO_KEY, "localUserDAO"),
            EQ(Rule.RULE_GROUP, "onboarding"),
            GT(RuleHistory.CREATED, previousExecution.getCreated()),
            NEQ(RuleHistory.RESULT, ComplianceValidationStatus.VALIDATED)
          )
        );

        if ( failedRuleHistory == null ) {
          business.setCompliance(ComplianceStatus.PASSED);
        }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: ` `
    },
    {
      name: 'canExecute',
      javaCode: `
      // TODO: add an actual implementation
      return true;
      `
    },
    {
      name: 'describe',
      javaCode: `
      // TODO: add an actual implementation
      return "";
      `
    }
  ]
});
