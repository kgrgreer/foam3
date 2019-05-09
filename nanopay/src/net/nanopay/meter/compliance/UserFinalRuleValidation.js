foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'UserFinalRuleValidation',

  documentation: 'Sets a user compliance status to approved if not otherwise marked by preceding compliance checks.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.nanos.auth.User',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
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
        
        // Make proper query to check all rule history status associated to the user
        ArraySink sink = (ArraySink) ruleHistoryDAO.where(
          AND(
            EQ(RuleHistory.OBJECT_ID, user.getId()),
            EQ(Rule.DAO_KEY, "localUserDAO")
          )
        ).select(GROUP_BY(RuleHistory.RULE_ID, new ArraySink()));

        for ( int i = 0; i < sink.getArray().size(); i++ ) {
          if ( sink.getArray().get(i).getResult() != null ) {
            if ( sink.getArray().get(i).getResult() == ComplianceValidationStatus.VALIDATED ) {
              user.setCompliance(ComplianceStatus.PASSED);
            }
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
