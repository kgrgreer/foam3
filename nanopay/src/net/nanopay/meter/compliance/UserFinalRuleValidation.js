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
    'java.util.Date',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'static foam.mlang.MLang.*'
  ],

  constants: [
    {
      type: 'Long',
      name: 'RULE_ID',
      value: 1300,
      documentation: 'The rule ID associated to this rule'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      User user = (User) obj;
      DAO ruleHistoryDAO = (DAO) x.get("ruleHistoryDAO");
      Date previousExecutionDate = new Date();
      RuleHistory failedRuleHistory;

      ArraySink sink = (ArraySink) ruleHistoryDAO.where(
        AND(
          EQ(RuleHistory.OBJECT_ID, user.getId()),
          EQ(RuleHistory.OBJECT_DAO_KEY, "localUserDAO"),
          EQ(RuleHistory.RULE_ID, RULE_ID)
        )
      ).orderBy(DESC(RuleHistory.CREATED)).limit(1).select(new ArraySink());

      if ( sink.getArray().size() > 0 ) {
        RuleHistory previousExecution = (RuleHistory) sink.getArray().get(0);
        previousExecutionDate = previousExecution.getCreated();
        failedRuleHistory = (RuleHistory) ruleHistoryDAO.find(
          AND(
            EQ(RuleHistory.OBJECT_ID, user.getId()),
            EQ(RuleHistory.OBJECT_DAO_KEY, "localUserDAO"),
            EQ(Rule.RULE_GROUP, "onboarding"),
            GT(RuleHistory.CREATED, previousExecutionDate),
            NEQ(RuleHistory.RESULT, ComplianceValidationStatus.VALIDATED)
          )
        );
      } else {
        failedRuleHistory = (RuleHistory) ruleHistoryDAO.find(
          AND(
            EQ(RuleHistory.OBJECT_ID, user.getId()),
            EQ(RuleHistory.OBJECT_DAO_KEY, "localUserDAO"),
            EQ(Rule.RULE_GROUP, "onboarding"),
            NEQ(RuleHistory.RESULT, ComplianceValidationStatus.VALIDATED)
          )
        );
      }

      if ( failedRuleHistory == null ) {
        // get localUserDAO and put the new user into the dao (due to permission issues)
        user.setCompliance(ComplianceStatus.PASSED);
        DAO localUserDAO = (DAO) x.get("localUserDAO");
        localUserDAO.put(user.fclone());
      }
      `
    }
  ]
});
