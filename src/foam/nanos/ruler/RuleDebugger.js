/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'RuleDebugger',
  extends: 'foam.nanos.ruler.Rule',
  documentation: `Rule to debug and print out all other rules.
  INSTRUCTIONS FOR USE:
  DAOKey: the DAO this rule runs on and subsequently tests.
  After: set to true to only test after rules. default is only test before rules
  Operation: to filter debugging rules to only certain operation. default is 3 (Create and Update)
  Rule Group: Do not forget to set one, and ensure it is on for debugging.

  Rule will run and log relevant predicate and permission evaluation based on the provided obj, on the operation and dao that is specified.
  `,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.auth.AuthService',
    'foam.nanos.ruler.Rule',
    'foam.nanos.ruler.RuleGroup',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.NEQ',
    'static foam.mlang.MLang.AND',
    'java.util.List'
  ],

  properties: [
    {
      name: 'action',
      transient: true,
      visibility: 'HIDDEN',
      javaGetter: 'return this;'
    },
    {
      name: 'predicate',
      transient: true,
      visibility: 'HIDDEN',
      javaGetter: 'return foam.mlang.MLang.TRUE;'
    },
    {
      class: 'Int',
      name: 'priority',
      value: 2147483647,
      documentation: 'Ensure this rule always runs first'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.dao.Operation',
      name: 'operation',
      value: 'CREATE_OR_UPDATE'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        x = ruler.getX();
        DAO rulerDAO = (DAO) x.get("ruleDAO");
        DAO ruleGroupDAO = (DAO) x.get("ruleGroupDAO");
        AuthService auth = (AuthService) x.get("auth");

        List rules = ((ArraySink) rulerDAO.where(
          AND(
            EQ(Rule.DAO_KEY, getDaoKey()),
            NEQ(Rule.ID, getId()),
            EQ(Rule.OPERATION, getOperation()),
            EQ(Rule.AFTER, getAfter())
          )).select(new ArraySink())).getArray();

        StringBuilder sb = new StringBuilder();
        sb.append("Performing Rule Debug on DAO: ");
        sb.append(getDaoKey());
        sb.append(" from rule: ");
        sb.append(getId());
        sb.append("\\n");
        Logger logger = (Logger) x.get("logger");

        if ( rules == null || rules.size() == 0 ) {
          sb.append("Error No Rules Found in DAOKey ");
          logger.error(sb.toString());
          throw new RuntimeException(sb.toString());
        }
        sb.append("\\nFound ");
        sb.append(rules.size());
        sb.append(" rules");
        for ( Object o : rules ) {
          Rule r = (Rule) o;
          if ( ! r.getEnabled() ) {
            sb.append(" Disabled: ");
            sb.append(r.getName());
            sb.append(" ");
            sb.append(r.getId());
            continue;
          }
          sb.append(" Enabled: ");
          sb.append(r.getName());
          sb.append(" ");
          sb.append(r.getId());
          RuleGroup group = (RuleGroup)ruleGroupDAO.find(r.getRuleGroup());
          if ( group == null ) {
            sb.append(" unable to find ruleGroup ");
            sb.append(r.getRuleGroup());
            continue;
          }
          sb.append(" group: ");
          sb.append(group.getId());
          if ( ! group.getEnabled() ) {
            sb.append(" Group is DISABLED");
            continue;
          }

          // --- Permission check ---

          User user = r.getUser(x, obj);
          sb.append("\\nRULE PERMISSION GRANTED: ");
          if ( user != null ) {
            sb.append(auth.checkUser(x, user, "rule.read." + r.getId()));
            sb.append("\\nRULEGROUP PERMISSION GRANTED: ");
            sb.append(auth.checkUser(x, user, "rulegroup.read." + group.getId()));
          }
          else {
            sb.append("NOT REQUIRED");
          }

          // --- Predicate check ---

          sb.append("\\nPREDICATE CHECK: ");
          sb.append(r.getPredicate().f(obj));
          sb.append("\\nGROUP PREDICATE CHECK: ");
          sb.append(group.getPredicate().f(obj));
        }

      logger.debug(sb.toString());
      `
    }
  ]
});
