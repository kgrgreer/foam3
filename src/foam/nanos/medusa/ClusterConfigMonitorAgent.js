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
    'foam.nanos.app.Health',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Timer',
    'java.util.concurrent.atomic.AtomicBoolean'
  ],

  javaCode: `
    protected AtomicBoolean executing_ = new AtomicBoolean();
  `,

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public ClusterConfigMonitorAgent(foam.core.X x, String id) {
    setX(x);
    setId(id);
  }

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
      class: 'foam.dao.DAOProperty',
      javaFactory: 'return (DAO) getX().get("localClusterConfigDAO");'
    },
    {
      name: 'timerInterval',
      class: 'Long',
      units: 'ms',
      value: 10000
    },
    {
      name: 'initialTimerDelay',
      class: 'Int',
      units: 'ms',
      value: 5000
    },
    {
      name: 'lastAlarmsSince',
      class: 'Date',
      javaFactory: 'return new java.util.Date(1081157732);'
    },
    {
      documentation: 'Store reference to timer so it can be cancelled, and agent restarted.',
      name: 'timer',
      class: 'Object',
      visibility: 'HIDDEN',
      networkTransient: true
    }
  ],

  methods: [
    {
      documentation: 'Start as a NanoService',
      name: 'start',
      javaCode: `
      Loggers.logger(getX(), this).info(getId(), "start", "interval", getTimerInterval());
      Timer timer = new Timer(this.getClass().getSimpleName()+"-"+getId(), true);
      setTimer(timer);
      timer.schedule(new ContextAgentTimerTask(getX(), this), getTimerInterval(), getTimerInterval());
      `
    },
    {
      name: 'execute',
      args: 'Context x',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, getId());
      if ( ! config.getEnabled() ) {
        return;
      }
      if ( executing_.get() ) {
        return;
      }
    synchronized ( this ) {
      executing_.set(true);
      PM pm = PM.create(x, this.getClass().getSimpleName(), getId());
      try {
        ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
        DAO client = support.getClientDAO(x, "clusterConfigDAO", myConfig, config);
        try {
          ClusterConfig cfg = (ClusterConfig) client.find_(x, config.getId());
          if ( cfg != null ) {
            getDao().put_(x, cfg);
          } else {
            Loggers.logger(x, this).warning(getId(), "client,find", "null");
          }
        } catch ( Throwable t ) {
          if ( config.getStatus() != Status.OFFLINE ) {
            Loggers.logger(x, this).debug(getId(), t.getMessage());
            ClusterConfig cfg = (ClusterConfig) config.fclone();
            cfg.setStatus(Status.OFFLINE);
            cfg.setIsPrimary(false);
            config = (ClusterConfig) getDao().put_(x, cfg);
            Health health = (Health) ((DAO) x.get("healthDAO")).find(config.getId());
            if ( health != null &&
                 health instanceof MedusaHealth ) {
              MedusaHealth medusaHealth = (MedusaHealth) health.fclone();
              medusaHealth.setMedusaStatus(config.getStatus());
              ((DAO) x.get("healthDAO")).put(medusaHealth);
            }
          }
          Throwable cause = t.getCause();
          if ( cause == null ||
               ! ( cause instanceof java.io.IOException ) &&
               config.getStatus() != Status.OFFLINE ) {
            Loggers.logger(x, this).warning(getId(), t.getMessage(), t);
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
          Loggers.logger(x, this).debug(getId(), t.getMessage(), t);
        }
        pm.error(x, t);
      } finally {
        pm.log(x);
        executing_.set(false);
      }
    }
      `
    }
  ]
});
