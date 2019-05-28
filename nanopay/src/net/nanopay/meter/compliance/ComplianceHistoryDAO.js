foam.CLASS({
    package: 'net.nanopay.meter.compliance',
    name: 'ComplianceHistoryDAO',
    extends: 'foam.dao.ReadOnlyDAO',

    imports: [
        'ruleHistoryDAO'
    ],

    javaImports: [
        'foam.dao.ArraySink',
        'foam.dao.DAO',
        'static foam.mlang.MLang.*',
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
                ((ArraySink)((foam.mlang.sink.Map)((DAO) x_.get("ruleDAO")).where(OR(
                  EQ(Rule.RULE_GROUP, "onboarding")
                )).select(MAP(Rule.ID, new ArraySink()))).getDelegate()).getArray().toArray()
              ));
            `
          }
    ]
})
