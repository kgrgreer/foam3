/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.app',
  name: 'Health',
  javaGenerateDefaultConstructor: false,

  javaImports: [
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.EQ',
    'foam.mlang.sink.Count',
    'foam.nanos.alarming.Alarm',
    'java.lang.Runtime'
  ],

  tableColumns: [
    'id',
    'version',
    'address',
    'port',
    'status',
    'uptime',
    'next',
    'alarms'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      javaFactory: `
      String name = System.getProperty("hostname", "localhost");
      if ( "localhost".equals(name) ) {
        name = System.getProperty("user.name");
      }
      return name;
      `,
      visibility: 'RO',
    },
    {
      name: 'name',
      shortName: 'n',
      class: 'String',
      visibility: 'RO',
    },
    {
      name: 'version',
      shortName: 'v',
      class: 'String',
      visibility: 'RO',
    },
    {
      name: 'address',
      shortName: 'a',
      class: 'String',
      visibility: 'RO',
    },
    {
      name: 'port',
      shortName: 'p',
      class: 'Int',
      javaFactory: 'return Integer.parseInt(System.getProperty("http.port", "8443"));',
      visibility: 'RO',
    },
    {
      name: 'status',
      shortName: 's',
      class: 'Enum',
      of: 'foam.nanos.app.HealthStatus',
      visibility: 'RO',
    },
    {
      name: 'mode',
      shortName: 'm',
      class: 'Enum',
      of: 'foam.nanos.app.Mode',
      visibility: 'RO',
    },
    {
      name: 'uptime',
      shortName: 'ut',
      class: 'Duration',
      visibility: 'RO',
    },
    {
      name: 'timeLast',
      shortName: 'tl',
      class: 'Long',
      units: 'ms',
      storageTransient: true,
      networkTransient: true,
      visibility: 'RO',
    },
    {
      name: 'timeCurrent',
      shortName: 'tc',
      class: 'Long',
      units: 'ms',
      visibility: 'RO',
    },
    {
      name: 'timeNext',
      shortName: 'tn',
      class: 'Long',
      units: 'ms',
      visibility: 'RO',
    },
    {
      name: 'next',
      class: 'Duration',
      javaGetter: 'return getTimeNext() - System.currentTimeMillis();',
      storageTransient: true,
      networkTransient: true,
      visibility: 'RO',
    },
    {
      name: 'memoryMax',
      shortName: 'mm',
      class: 'Long',
      units: 'bytes',
      visibility: 'RO',
    },
    {
      name: 'memoryFree',
      shortName: 'mf',
      class: 'Long',
      units: 'bytes',
      visibility: 'RO',
    },
    {
      name: 'alarms',
      shortName: 'al',
      class: 'Int',
      visibility: 'RO',
    },
    {
      name: 'errorMessage',
      shortName: 'em',
      class: 'String',
      visibility: 'RO',
    }
  ],

  javaCode: `
  public Health() {
    super();
  }

  public Health(foam.core.X x) {
    super();
    setX(x);
    Health old = (Health) ((foam.dao.DAO) x.get("healthDAO")).find_(x, getId());
    if ( old != null &&
      getTimeLast() == 0L ) {
      setTimeLast(old.getTimeCurrent());
    }
    setTimeCurrent(System.currentTimeMillis());

    AppConfig appConfig = (AppConfig) x.get("appConfig");
    setMode(appConfig.getMode());
    setVersion(appConfig.getVersion());

    setUptime(System.currentTimeMillis() - (Long) x.get(foam.nanos.boot.Boot.BOOT_TIME));

    Runtime runtime = Runtime.getRuntime();
    setMemoryMax(runtime.maxMemory());
    setMemoryFree(runtime.freeMemory());

    DAO alarmDAO = (DAO) x.get("alarmDAO");
    alarmDAO = alarmDAO.where(
      AND(
        EQ(Alarm.HOSTNAME, System.getProperty("hostname", "localhost")),
        EQ(Alarm.SEVERITY, LogLevel.ERROR),
        EQ(Alarm.IS_ACTIVE, true)
      )
    );
    Count count = (Count) alarmDAO.select(COUNT());
    if ( count != null ) {
      setAlarms(((Long) count.getValue()).intValue());
    } else {
      setAlarms(0);
    }
  }
  `
});
