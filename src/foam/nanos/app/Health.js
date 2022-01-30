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
    'foam.net.Port',
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
    'nextHeartbeatIn',
    'alarms'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
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
      name: 'bootTime',
      shortName: 'bt',
      class: 'Long',
      visibility: 'RO',
    },
    {
      name: 'upTime',
      shortName: 'ut',
      class: 'Duration',
      javaFactory: 'return System.currentTimeMillis() - getBootTime();',
      visibility: 'RO',
      clusterTransient: true
    },
    {
      name: 'heartbeatTime',
      shortName: 'ht',
      class: 'Long',
      units: 'ms',
      visibility: 'RO',
    },
    {
      name: 'heartbeatSchedule',
      shortName: 'hs',
      class: 'Long',
      units: 'ms',
      visibility: 'RO',
    },
    {
      name: 'nextHearbeatIn',
      class: 'Duration',
      expression: function(heartbeatTime, heartbeatSchedule) {
        if ( heartbeatTime && heartbeatSchedule && heartbeatSchedule > 0 ) {
          return (heartbeatTime + heartbeatSchedule) - Date.now();
        }
        return 0;
      },
      javaGetter: `
      if ( getHeartbeatSchedule() > 0L ) {
        return (getHeartbeatTime() + getHeartbeatSchedule()) - System.currentTimeMillis();
      }
      return 0L;
      `,
      visibility: 'RO',
      clusterTransient: true
    },
    {
      name: 'propogationTime',
      class: 'Duration',
      visibility: 'RO',
      clusterTransient: true
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
    }
  ],

  javaCode: `
  public Health() {
    super();
  }

  public Health(foam.core.X x) {
    super();
    setX(x);

    String id = System.getProperty("hostname", "localhost");
    if ( "localhost".equals(id) ) {
      id = System.getProperty("user.name");
    }
    setId(id);

    AppConfig appConfig = (AppConfig) x.get("appConfig");
    setMode(appConfig.getMode());

    StringBuilder sb = new StringBuilder();
    String version = this.getClass().getPackage().getImplementationVersion();
    if ( foam.util.SafetyUtil.isEmpty(version) ) {
      sb.append(appConfig.getVersion());
    } else {
      String revision = this.getClass().getPackage().getSpecificationVersion();
      sb.append(version);
      if ( ! foam.util.SafetyUtil.isEmpty(revision) &&
           revision.length() > 2 ) {
        sb.append("-"+revision.substring(0, 3));
      }
    }
    setVersion(sb.toString());

    int port = Integer.parseInt(System.getProperty("http.port", "0"));
    if ( port != 0 ) {
      setPort(port);
    } else {
      setPort(Port.get(getX(), "http"));
    }

    setBootTime((Long) x.get(foam.nanos.boot.Boot.BOOT_TIME));

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

    // NOTE: this works in conjunction with heartbear service -
    // which creates entry for 'self'
    Health old = (Health) ((DAO) x.get("healthDAO")).find_(x, getId());
    if ( old == null ) {
      setStatus(HealthStatus.DOWN);
    } else {
      setStatus(HealthStatus.UP);
    }
  }
  `,
  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.id + '/' + this.address;
      },
      javaCode: `
      StringBuilder sb = new StringBuilder();
      sb.append(getId());
      sb.append("/");
      sb.append(getAddress());
      return sb.toString();
      `
    }
  ]
});
