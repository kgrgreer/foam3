/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
 package: 'foam.nanos.cron',
 name: 'ScheduleSchedulableRuleAction',

 documentation: 'Add schedulable to cronjobDAO',

 implements: [
   'foam.nanos.ruler.RuleAction'
 ],

 javaImports: [
   'foam.core.ContextAgent',
   'foam.core.FObject',
   'foam.core.X',
   'foam.dao.DAO',
   'foam.nanos.cron.Schedulable'
 ],

 methods: [
   {
     name: 'applyAction',
     javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            var schedulable = (Schedulable) ((FObject)obj).fclone();
            if ( schedulable.getEnabled() ) {
              DAO cronJobDAO = (DAO) x.get("cronJobDAO");
              schedulable.setScheduledTime(schedulable.getNextScheduledTime(getX()));
              cronJobDAO.put(schedulable);
            }
          }
        }, "Add schedulable to cronjobDAO");
     `
   }
 ]
});
