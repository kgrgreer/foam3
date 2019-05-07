foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'UserFinalRuleValidation',

  documentation: 'Sets a user compliance status to approved if not otherwise marked by preceding compliance checks.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.ruler.Rule',
    'foam.nanos.ruler.RuleHistory',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'net.nanopay.meter.compliance.ComplianceService',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        // check rule history dao, go through history and set users compliance validation based on results
        DAO ruleHistoryDAO = (DAO) x.get("ruleHistoryDAO");

        ArraySink sink = (ArraySink) ruleHistoryDAO.where(
          AND(
            EQ(Rule.DAO_KEY, "localUserDAO"),
            EQ(RuleHistory.OBJECT_ID, user.getId())
          )
        ).select(GROUP_BY(RuleHistory.RULE_ID, new ArraySink()));
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: ` `
    }
  ]
});
