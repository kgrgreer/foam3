/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigMonitorAgent',

  implements: [
    'foam.core.ContextAgent'
  ],

  documentation: 'Attempt to contact Nodes and Mediators, record ping time and mark them ONLINE or OFFLINE.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.ContextAgentTimerTask',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.GTE',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Timer'
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public ClusterConfigMonitorAgent(foam.core.X x, String id, foam.dao.DAO dao) {
    setX(x);
    setId(id);
    setDao(dao);
  }
        `);
      }
    }
  ],

  properties: [
    {
      name: 'id',
      class: 'String'
    },
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty'
    },
    {
      name: 'timerInterval',
      class: 'Long',
      value: 10000
    },
    {
      name: 'initialTimerDelay',
      class: 'Int',
      value: 5000
    },
    {
      name: 'lastAlarmsSince',
      class: 'Date',
      javaFactory: 'return new java.util.Date(1081157732);'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName(),
          this.getId()
        }, (Logger) getX().get("logger"));
      `
    }
 ],

  methods: [
    {
      documentation: 'Start as a NanoService',
      name: 'start',
      javaCode: `
      getLogger().info("start", "interval", getTimerInterval());
      Timer timer = new Timer(this.getClass().getSimpleName()+"-"+getId(), true);
      timer.schedule(new ContextAgentTimerTask(getX(), this), getTimerInterval(), getTimerInterval());
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), getId());
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, getId());
      try {
        if ( ! config.getEnabled() ) {
          return;
        }
        ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
        DAO client = support.getClientDAO(x, "clusterConfigDAO", myConfig, config);
        try {
          long startTime = System.currentTimeMillis();
          ClusterConfig cfg = (ClusterConfig) client.find_(x, config.getId());
          if ( cfg != null ) {
            cfg.setPingTime(System.currentTimeMillis() - startTime);
            getDao().put_(x, cfg);
          } else {
            getLogger().warning("client,find", "null");
          }
        } catch ( Throwable t ) {
          if ( config.getStatus() != Status.OFFLINE ) {
            getLogger().debug(t.getMessage());
            ClusterConfig cfg = (ClusterConfig) config.fclone();
            cfg.setStatus(Status.OFFLINE);
            config = (ClusterConfig) getDao().put_(x, cfg);
          }
          Throwable cause = t.getCause();
          if ( cause == null ||
               ! ( cause instanceof java.io.IOException ) &&
               config.getStatus() != Status.OFFLINE ) {
            getLogger().warning(t.getMessage(), t);
          }
          return;
        }

        java.util.Date now = new java.util.Date();
        client = support.getClientDAO(x, "alarmDAO", myConfig, config);
        client = client.where(
          AND(
            EQ(Alarm.SEVERITY, LogLevel.ERROR),
            EQ(Alarm.CLUSTERABLE, false),
            EQ(Alarm.HOSTNAME, config.getName()),
            GTE(Alarm.LAST_MODIFIED, getLastAlarmsSince())
          )
        );
        List<Alarm> alarms = (List) ((ArraySink) client.select(new ArraySink())).getArray();
        if ( alarms != null ) {
          DAO alarmDAO = (DAO) x.get("alarmDAO");
          for (Alarm alarm : alarms ) {
            alarm.setClusterable(false);
            alarmDAO.put(alarm);
          }
        }
        setLastAlarmsSince(now);
      } catch ( Throwable t ) {
        Throwable cause = t.getCause();
        if ( cause == null ||
             ! ( cause instanceof java.io.IOException ) &&
             config.getStatus() != Status.OFFLINE ) {
          getLogger().debug(t.getMessage(), t);
        }
        pm.error(x, t);
      } finally {
        pm.log(x);
      }
      `
    }
  ]
});
