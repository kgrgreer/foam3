foam.CLASS({
    package: 'net.nanopay.meter.compliance',
    name: 'ComplianceHistoryDAO',
    extends: 'foam.dao.ReadOnlyDAO',

    imports: [
        'ruleHistoryDAO'
    ],

    javaImports: [
        'foam.core.FObject',
        'foam.core.X',
        'foam.dao.ArraySink',
        'foam.dao.DAO',
        'foam.dao.ReadOnlyDAO',
        'static foam.mlang.MLang.*',

        'foam.dao.Sink',
        'foam.mlang.predicate.Predicate',
        'foam.nanos.ruler.Rule',
        'foam.nanos.ruler.RuleHistory'
    ],

    methods: [
        {
            name: 'find_',
            javaCode: `
                return filterDelegate().find(id);
            `
          },
          {
            name: 'select_',
            javaCode: `
                return filterDelegate().select(sink);
            `
          },
          {
            name: 'where',
            javaCode: `
                return filterDelegate().where(predicate);
            `
          },
          {
            name: 'filterDelegate',
            type: 'foam.dao.DAO',
            args: [],
            javaCode: `
                return getDelegate().where(IN(
                    RuleHistory.RULE_ID,
                    ((ArraySink) ((DAO) x_.get("ruleDAO")).where(OR(
                        EQ(Rule.RULE_GROUP, "onboarding"),
                        EQ(Rule.RULE_GROUP, "compliance")
                    )).select(new ArraySink())).getArray().stream().map((rule) -> ((Rule)rule).getId()).toArray()
                ));
            `
          }
    ]
})
