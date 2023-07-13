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
    'alarms',
    'bootTime'
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
      // NOTE: bootTime must be present in tableColumns for upTime to reported correctly in tableView
      name: 'bootTime',
      shortName: 'bt',
      class: 'Long',
      visibility: 'RO',
      tableCellFormatter: function(value) {
        this.add(new Date(value).toISOString());
      }
    },
    {
      name: 'upTime',
      shortName: 'ut',
      class: 'Duration',
      getter: function() {
        return Date.now() - this.bootTime;
      },
      javaGetter: 'return System.currentTimeMillis() - getBootTime();',
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
      getter: function() {
        var time = 0;
        if ( this.heartbeatTime && this.heartbeatSchedule && this.heartbeatSchedule > 0 ) {
          time = (this.heartbeatTime + this.heartbeatSchedule) - Date.now();
        }
        return time;
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
      name: 'memoryTotal',
      shortName: 'mt',
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
      name: 'memoryUsed',
      shortName: 'mu',
      class: 'Long',
      units: 'bytes',
      storageTransient: true,
      visibility: 'RO',
      getter: function() {
        return this.memoryTotal - this.memoryFree;
      },
      javaGetter: `
      return getMemoryTotal() - getMemoryFree();
      `
    },
    {
      name: 'memoryUsedPercent',
      label: 'Memory Used %',
      class: 'Long',
      storageTransient: true,
      visibility: 'RO',
      getter: function() {
        if ( this.memoryTotal && this.memoryTotal > 0 ) {
          return ( (this.memoryTotal - this.memoryFree) / this.memoryTotal ) * 100.0;
        }
        return 0;
      },
      javaGetter: `
      if ( getMemoryTotal() > 0 ) {
        return (long) (((getMemoryTotal() - getMemoryFree()) / (float) getMemoryTotal()) * 100.0);
      }
      return 0L;
      `
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
    setMemoryTotal(runtime.totalMemory());
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

    // NOTE: this works in conjunction with heartbeat service -
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
