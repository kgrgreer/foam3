foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'BusinessFinalRuleValidation',

  documentation: 'Sets a businesses compliance to passed if not otherwise marked by preceding compliance checks.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'net.nanopay.model.Business',
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
        Business business = (Business) obj;
        Boolean passed = true;
        DAO ruleHistoryDAO = (DAO) x.get("ruleHistoryDAO");

        ArraySink sink = (ArraySink) ruleHistoryDAO.where(
          AND(
            EQ(RuleHistory.OBJECT_ID, business.getId()),
            EQ(RuleHistory.OBJECT_DAO_KEY, "localUserDAO"),
            EQ(Rule.RULE_GROUP, "onboarding")
          )
        ).select(GROUP_BY(RuleHistory.RULE_ID, new ArraySink()));

        for ( int i = 0; i < sink.getArray().size(); i++ ) {
          RuleHistory ruleHistory = (RuleHistory) sink.getArray().get(i);
          if ( (ComplianceValidationStatus) ruleHistory.getResult() != ComplianceValidationStatus.VALIDATED ) {
            passed = false;
          }
        }

        if ( passed ) {
          business.setCompliance(ComplianceStatus.PASSED);
        }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: ` `
    }
  ]
});
