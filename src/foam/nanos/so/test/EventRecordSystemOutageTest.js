/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.so.test',
  name: 'EventRecordSystemOutageTest',
  extends: 'foam.nanos.test.Test',

  documentation: 'Create EventRecord with SytemEvent, change EventRecord severity, test SystemOutage activates, deactivates.',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'foam.nanos.cron.Cron',
    'foam.nanos.er.*',
    'foam.nanos.so.*'
  ],

  methods: [
    {
      name: 'setup',
      args: 'X x',
      javaCode: `
      DAO cronDAO = (DAO) x.get("cronDAO");
      Cron cron = (Cron) cronDAO.find("SystemOutage").fclone();
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
      SystemOutageAgent agent = new SystemOutageAgent(x);

      SystemOutage se = new SystemOutage(x);
      se.setName(this.getClass().getSimpleName());
      se.setEnabled(true);
      se.setActive(false);
      se.setStartTime(new java.util.Date(System.currentTimeMillis() + 36000));
      se = (SystemOutage) seDAO.put(se);
      test ( ! se.getActive(), "SystemOutage not active");

      EventRecord er = new EventRecord(x, this, "test");
      er.setSystemOutage(se.getId());

      er.setSeverity(LogLevel.INFO);
      er = (EventRecord) erDAO.put(er).fclone();
      agent.execute(x);
      se = (SystemOutage) seDAO.find(se.getId());
      test ( ! se.getActive(), "EventRecord INFO->INFO, SystemOutage not active");

      er.setSeverity(LogLevel.WARN);
      er = (EventRecord) erDAO.put(er).fclone();
      agent.execute(x);
      se = (SystemOutage) seDAO.find(se.getId());
      test ( se.getActive(), "EventRecord INFO->WARN, SystemOutage active");

      er.setSeverity(LogLevel.INFO);
      er = (EventRecord) erDAO.put(er).fclone();
      agent.execute(x);
      se = (SystemOutage) seDAO.find(se.getId());
      test ( ! se.getActive(), "EventRecord WARN->INFO, SystemOutage not active");
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
      Cron cron = (Cron) cronDAO.find("SystemOutage").fclone();
      cron.setEnabled(true);
      cronDAO.put(cron);
      `
    },
  ]
})
