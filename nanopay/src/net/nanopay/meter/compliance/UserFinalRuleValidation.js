foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'UserFinalRuleValidation',

  documentation: 'Sets a users compliance to passed if not otherwise marked by preceding compliance checks.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'foam.nanos.ruler.RuleHistory',
    'foam.nanos.ruler.Rule',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      User user = (User) obj;
      DAO ruleHistoryDAO = (DAO) x.get("ruleHistoryDAO");

      ArraySink sink = (ArraySink) ruleHistoryDAO.where(
        AND(
          EQ(RuleHistory.OBJECT_ID, user.getId()),
          EQ(RuleHistory.OBJECT_DAO_KEY, "localUserDAO"),
          EQ(RuleHistory.RULE_ID, 1300)
        )
      ).orderBy(DESC(RuleHistory.CREATED)).limit(1).select(new ArraySink());

      RuleHistory previousExecution = (RuleHistory) sink.getArray().get(0);

      RuleHistory failedRuleHistory = (RuleHistory) ruleHistoryDAO.find(
        AND(
          EQ(RuleHistory.OBJECT_ID, user.getId()),
          EQ(RuleHistory.OBJECT_DAO_KEY, "localUserDAO"),
          EQ(Rule.RULE_GROUP, "onboarding"),
          GT(RuleHistory.CREATED, previousExecution.getCreated()),
          NEQ(RuleHistory.RESULT, ComplianceValidationStatus.VALIDATED)
        )
      );

      if ( failedRuleHistory == null ) {
        user.setCompliance(ComplianceStatus.PASSED);
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
