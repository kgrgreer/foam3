/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.er',
  name: 'EventRecordSystemEventRuleAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],

  documentation: `Manage a SystemEvent based on EventRecord severity`,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.logger.Loggers',
    'foam.nanos.se.SystemEvent'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      EventRecord er = (EventRecord) obj;
      EventRecord old = (EventRecord) oldObj;
      boolean raise = false;
      boolean lower = false;
      if ( old == null ) {
        // Rule predicate tests for n warning or error
        raise = true;
      } else {
        // Rule predicate tests if severity has changed.
        if ( old.getSeverity().getOrdinal() <= LogLevel.INFO.getOrdinal() &&
             er.getSeverity().getOrdinal() > LogLevel.INFO.getOrdinal() ) {
          raise = true;
        } else if ( old.getSeverity().getOrdinal() > LogLevel.INFO.getOrdinal() &&
                    er.getSeverity().getOrdinal() <= LogLevel.INFO.getOrdinal() ) {
          lower = true;
        }
      }
      if ( raise || lower ) {
        DAO dao = ((DAO) ruler.getX().get("systemEventDAO"));
        SystemEvent se = (SystemEvent) dao.find(
          AND(
            EQ(SystemEvent.ENABLED, true),
            EQ(SystemEvent.ID, er.getSystemEvent())
          ));
        if ( se == null ) {
          Loggers.logger(x, this).error("SystemEvent not found", "er", er.getId(), "se", er.getSystemEvent());
        } else {
          se = (SystemEvent) se.fclone();
          if ( raise ) {
            se.setStartTime(new java.util.Date());
            Loggers.logger(x, this).info("Toggled SystemEvent",se.getId(), "enabled");
          } else {
            se.setEndTime(new java.util.Date());
            Loggers.logger(x, this).info("Toggled SystemEvent", se.getId(), "disable");
          }
          dao.put(se);
          // cron will run the agent.
        }
      }
      `
    }
  ]
})
