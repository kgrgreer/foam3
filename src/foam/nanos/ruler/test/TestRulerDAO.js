/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.test',
  name: 'TestRulerDAO',
  extends: 'foam.nanos.ruler.RulerDAO',

  documentation: 'Drop in, verbose, replacement for RulerDAO',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.GroupBy',
    'foam.nanos.logger.Logger',
    'foam.nanos.ruler.RuleEngine',
    'foam.nanos.ruler.RuleGroup',
    'java.util.List',
    'java.util.Map'
  ],

  javaCode: `
  public TestRulerDAO(X x, DAO delegate, String name) {
    super(x, delegate, name);
  }
  `,

  methods: [
    {
      name: 'applyRules',
      javaCode: `
      var logger = (Logger) x.get("logger");
      var ruleGroups = getRuleGroups().get(pred);
      logger.info("applyRules", "ruleGroups", ruleGroups.size(), "predicate", pred);
      var sink = getRulesList().get(pred);
      for ( var rg : ruleGroups ) {
        if ( rg.f(x, obj, oldObj) ) {
          logger.debug("applyRules", "ruleGroup", rg.getId(), true);
          var rules = ((ArraySink) sink.getGroups().get(rg.getId())).getArray();
          if ( ! rules.isEmpty() ) {
            logger.debug("applyRules", "ruleGroup", rg.getId(), rules.size());
            new TestRuleEngine(x, getX(), getDelegate()).execute(rules, obj, oldObj);
          } else {
            logger.debug("applyRules", "ruleGroup", rg.getId(), 0);
          }
        } else {
          logger.debug("applyRules", "ruleGroup", rg.getId(), false);
        }
      }
      `
    }
  ]
})
