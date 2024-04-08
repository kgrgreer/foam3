/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.se.test',
  name: 'EventRecordSystemEventTest',
  extends: 'foam.nanos.test.Test',

  documentation: 'Create EventRecord with SytemEvent, change EventRecord severity, test SystemEvent activates, deactivates.',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'foam.nanos.cron.Cron',
    'foam.nanos.er.*',
    'foam.nanos.se.*'
  ],

  methods: [
    {
      name: 'setup',
      args: 'X x',
      javaCode: `
      DAO cronDAO = (DAO) x.get("cronDAO");
      Cron cron = (Cron) cronDAO.find("SystemEvent").fclone();
      cron.setEnabled(false);
      cronDAO.put(cron);
      `
    },
    {
      name: 'runTest',
      javaCode: `
    setup(x);

    try {
      DAO seDAO = (DAO) x.get("systemEventDAO");
      DAO erDAO = (DAO) x.get("eventRecordDAO");

      // explicity run the agent the cron would normally run.
      SystemEventAgent agent = new SystemEventAgent(x);

      SystemEvent se = new SystemEvent(x);
      se.setName(this.getClass().getSimpleName());
      se.setEnabled(true);
      se.setActive(false);
      se.setStartTime(new java.util.Date(System.currentTimeMillis() + 3600));
      se = (SystemEvent) seDAO.put(se);

      EventRecord er = new EventRecord(x, this, "test");
      er.setSystemEvent(se.getId());

      er.setSeverity(LogLevel.INFO);
      er = (EventRecord) erDAO.put(er).fclone();
      agent.execute(x);
      se = (SystemEvent) seDAO.find(se.getId());
      test ( ! se.getActive(), "EventRecord INFO->INFO, SystemEvent not active");

      er.setSeverity(LogLevel.WARN);
      er = (EventRecord) erDAO.put(er).fclone();
      agent.execute(x);
      se = (SystemEvent) seDAO.find(se.getId());
      test ( se.getActive(), "EventRecord INFO->WARN, SystemEvent active");

      er.setSeverity(LogLevel.INFO);
      er = (EventRecord) erDAO.put(er).fclone();
      agent.execute(x);
      se = (SystemEvent) seDAO.find(se.getId());
      test ( se.getActive(), "EventRecord WARN->INFO, SystemEvent not active");
    } finally {
      teardown(x);
    }
      `
    },
    {
      name: 'teardown',
      args: 'X x',
      javaCode: `
      DAO cronDAO = (DAO) x.get("cronDAO");
      Cron cron = (Cron) cronDAO.find("SystemEvent").fclone();
      cron.setEnabled(true);
      cronDAO.put(cron);
      `
    },
  ]
})
