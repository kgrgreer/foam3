/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'UpdateRulesListSink',
  extends: 'foam.dao.AbstractSink',

  documentation: 'Updates rules list of RulerDAO.',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.mlang.order.Desc',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.GroupBy',
    'java.util.Collections',
    'java.util.List',
    'java.util.Map'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.ruler.RulerDAO',
      name: 'dao'
    }
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
        // REVIEW: When rule.daoKey changes, the listener will skip the update.
        Rule rule = (Rule) obj;
        if ( ! rule.getDaoKey().equals(dao_.getDaoKey()) ) {
          return;
        }

        // REVIEW: When rule.ruleGroup/operation/after properties change, would
        // also need to reload the rules list for the previous group.
        var rulesList = dao_.getRulesList();
        String ruleGroup = rule.getRuleGroup();
        for ( Object key : rulesList.keySet() ) {
          if ( ((Predicate) key).f(obj) ) {
            rule.setX(getX());
            var groupBy = rulesList.get(key);
            if ( groupBy.getGroupKeys().contains(ruleGroup) ) {
              List<Rule> rules = ((ArraySink) groupBy.getGroups().get(ruleGroup)).getArray();
              Rule foundRule = Rule.findById(rules, rule.getId());
              if ( foundRule != null ) {
                rules.remove(foundRule);
                if ( rule.getEnabled() ) {
                  rules.add(foundRule.updateRule(rule));
                }
              } else {
                if ( rule.getEnabled() ) {
                  rules.add(rule);
                }
              }
              Collections.sort(rules, new Desc(Rule.PRIORITY));
            } else {
              groupBy.putInGroup_(sub, ruleGroup, obj);
            }
            dao_.updateRuleGroups((Predicate) key);
          }
        }
      `
    },
    {
      name: 'remove',
      javaCode: `
        Rule rule = (Rule) obj;
        if ( ! rule.getDaoKey().equals(dao_.getDaoKey()) ) {
          return;
        }

        var rulesList = dao_.getRulesList();
        String ruleGroup = rule.getRuleGroup();
        for ( Object key : rulesList.keySet() ) {
          if ( ((Predicate) key).f(obj) ) {
            var groupBy = rulesList.get(key);
            if ( groupBy.getGroupKeys().contains(ruleGroup) ) {
              List<Rule> rules = ((ArraySink) groupBy.getGroups().get(ruleGroup)).getArray();
              Rule foundRule = Rule.findById(rules, rule.getId());
              if ( foundRule != null ) {
                rules.remove(foundRule);
                dao_.updateRuleGroups((Predicate) key);
              }
            }
          }
        }
      `
    }
  ]
});
