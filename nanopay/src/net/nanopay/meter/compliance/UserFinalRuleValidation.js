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
    'foam.dao.ProxySink',
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
        Boolean passed = true;
        DAO ruleHistoryDAO = (DAO) x.get("ruleHistoryDAO");

        // do a select, but in each put to the sink, check some logic, and basically you can return from there.
        // define the lookup logic

        ProxySink decoratedSink = new ProxySink(x, new ArraySink() ) {
          @Override
          public void put(Object obj, foam.core.Detachable sub) {
            RuleHistory ruleHistory = (RuleHistory) obj;
            if ( (ComplianceValidationStatus) ruleHistory.getResult() != ComplianceValidationStatus.VALIDATED ) {
              eof();
              throw new RuntimeException("Final Compliance Validation for user " + user.getId() + "failed");
            }
          }
        };

        try {
          ArraySink sink = (ArraySink) ruleHistoryDAO.where(
            AND(
              EQ(RuleHistory.OBJECT_ID, user.getId()),
              EQ(RuleHistory.OBJECT_DAO_KEY, "localUserDAO"),
              EQ(Rule.RULE_GROUP, "onboarding")
            )
          ).select(decoratedSink);
        } catch (Exception e) {
          // make sure we capture the right exception
          passed = false;
          System.out.println("IT WORKED DJ!");
        } 

        if ( passed ) {
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
