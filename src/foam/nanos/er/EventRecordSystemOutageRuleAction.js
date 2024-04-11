/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.er',
  name: 'EventRecordSystemOutageRuleAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],

  documentation: `Manage a SystemOutage based on EventRecord severity`,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.logger.Loggers',
    'foam.nanos.so.SystemOutage'
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
        if ( er.getSeverity().getOrdinal() > LogLevel.INFO.getOrdinal() ) {
          // Rule predicate tests for n warning or error
          raise = true;
        }
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
        SystemOutage se = (SystemOutage) dao.find(
          AND(
            EQ(SystemOutage.ENABLED, true),
            EQ(SystemOutage.ID, er.getSystemOutage())
          ));
        if ( se == null ) {
          Loggers.logger(x, this).error("SystemOutage not found", "er", er.getId(), "se", er.getSystemOutage());
        } else {
          se = (SystemOutage) se.fclone();
          if ( raise ) {
            se.setStartTime(new java.util.Date());
            Loggers.logger(x, this).info("Toggled SystemOutage",se.getId(), "enabled");
          } else {
            se.setEndTime(new java.util.Date());
            Loggers.logger(x, this).info("Toggled SystemOutage", se.getId(), "disable");
          }
          dao.put(se);
          // cron will run the agent.
        }
      }
      `
    }
  ]
})
