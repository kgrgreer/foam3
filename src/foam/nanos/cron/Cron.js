/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'Cron',
  extends: 'foam.nanos.script.Script',

  imports: [
    'cronDAO'
  ],

  topics: [
    'finished',
    'throwError'
  ],

  requires: [
    'foam.dao.AbstractDAO',
    'foam.log.LogLevel',
    'foam.nanos.cron.IntervalSchedule',
    'foam.nanos.cron.TimeHMS'
  ],

  javaImports: [
    'foam.core.ClientRuntimeException',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.er.EventRecord',
    'foam.nanos.logger.Logger',
    'foam.nanos.script.ScriptStatus',
    'java.util.Date'
  ],

  documentation: 'FOAM class that models a Cron script',

  tableColumns: [
    'id',
    'enabled',
    'lastDuration',
    'lastRun',
    'status',
    'scheduledTime',
    'run'
  ],

  searchColumns: [
    'id',
    'description',
    'enabled',
    'status'
  ],

  sections: [
    {
      name: 'scheduling',
      order: 2
    },
    {
      name: 'scriptEvents',
      title: 'Events',
      order: 3
    },
    {
      name: '_defaultSection',
      title: 'Info',
      order: 1
    }
  ],

  messages: [
    {
      name: 'SUCCESS_ENABLED',
      message: 'Successfully enabled'
    },
    {
      name: 'SUCCESS_DISABLED',
      message: 'Successfully disabled'
    }
  ],

  properties: [
    {
      documentation: 'Cron jobs shall be enabled as a deployment step.',
      class: 'Boolean',
      name: 'enabled'
    },
    {
      name: 'server',
      hidden: true,
      value: true
    },
    {
      name: 'schedule',
      class: 'FObjectProperty',
      of: 'foam.nanos.cron.Schedule',
      view: {
        class: 'foam.u2.view.FObjectView',
        of: 'foam.nanos.cron.Schedule'
      },
      section: 'scheduling',
      javaFactory: `return new CronSchedule.Builder(getX()).build();`
    },
    {
      class: 'DateTime',
      name: 'scheduledTime',
      documentation: 'Scheduled time to run Cron script.',
      visibility: 'RO',
      tableWidth: 170,
      storageTransient: true
    },
    {
      name: 'reattemptRequested',
      class: 'Boolean',
      storageTransient: true,
      visibility: 'RO'
    },
    {
      name: 'maxReattempts',
      class: 'Int',
      value: 2
    },
    {
      name: 'reattempts',
      class: 'Int',
      storageTransient: true,
      visibility: 'RO'
    },
    {
      documentation: 'Schedule to use to re-schedule on script failure',
      name: 'reattemptSchedule',
      class: 'FObjectProperty',
      of: 'foam.nanos.cron.Schedule',
      view: {
        class: 'foam.u2.view.FObjectView',
        of: 'foam.nanos.cron.Schedule'
      },
      section: 'scheduling',
      factory: function() {
        return this.IntervalSchedule.create({
          duration: this.TimeHMS.create({
            minute:5
          })
        });
      },
      javaFactory: `
      return new IntervalSchedule.Builder(getX())
        .setDuration(new TimeHMS.Builder(getX())
          .setMinute(5)
          .build())
        .build();
      `
    },
    {
      class: 'String',
      name: 'daoKey',
      value: 'cronJobDAO',
      transient: true,
      visibility: 'HIDDEN',
    },
    {
      class: 'String',
      name: 'eventDaoKey',
      value: 'cronJobEventDAO',
      transient: true,
      visibility: 'HIDDEN',
    }
  ],

  methods: [
    {
      name: 'canRun',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Boolean',
      javaCode: `
        if ( getClusterable() ) {
          foam.nanos.medusa.ClusterConfigSupport support = (foam.nanos.medusa.ClusterConfigSupport) x.get("clusterConfigSupport");
          if ( support != null &&
               ! support.cronEnabled(x, getClusterable()) ) {
            // ((Logger) x.get("logger")).debug(this.getClass().getSimpleName(), "execution disabled.", getId(), getDescription());
            return false;
          }
        }
        if ( getReattemptRequested() )
          return getReattempts() < getMaxReattempts();

        return true;
      `
    },
    {
      name: 'getNextScheduledTime',
      args: [
        {
          name: 'x',
          type: 'X'
        }
      ],
      type: 'Date',
      javaCode: `
      if ( getReattemptRequested() &&
           getReattempts() < getMaxReattempts() ) {
        return getReattemptSchedule().getNextScheduledTime(x,
          new Date(System.currentTimeMillis())
        );
      }
      return getSchedule().getNextScheduledTime(x,
        new Date(System.currentTimeMillis())
      );
      `
    },
    {
      name: 'runScript',
      code: function() {

        this.super.runScript();
      },
      javaCode: `
      if ( getReattemptRequested() &&
           getReattempts() < getMaxReattempts() ) {
        setReattempts(getReattempts() +1);
        setReattemptRequested(false);
        String attempt = "reattempt ("+getReattempts()+" of "+getMaxReattempts()+")";
        try {
          er(x, attempt, LogLevel.WARN, null);
          super.runScript(x);
          if ( ! getReattemptRequested() ) {
            resetReattempts();
            getReattemptSchedule().postExecution();
          } else if ( getReattempts() >= getMaxReattempts() ) {
            er(x, "max reattempts reached", LogLevel.ERROR, null);
            er(x, "disable on error", LogLevel.WARN, null);
            setEnabled(false);
          } else if ( getReattempts() == 0 ) {
            er(x, "reattempt requested", LogLevel.WARN, null);
          } else {
            er(x, attempt+" failed", LogLevel.WARN, null);
          }
        } catch ( RuntimeException e ) {
          er(x, "disable on error", LogLevel.WARN, null);
          setEnabled(false);
          throw e;
        }
      } else if ( ! getReattemptRequested() ) {
        try {
          er(x, null, LogLevel.INFO, null);
          super.runScript(x);
          getSchedule().postExecution();
        } catch ( RuntimeException e ) {
          er(x, "disable on error", LogLevel.WARN, null);
          setEnabled(false);
          throw e;
        }
      }
      `
    },
    {
     documentation: 'Request job is rescheduled',
      name: 'reattempt',
      javaCode: `
      setReattemptRequested(true);
      `
    },
    {
      documentation: 'Request job is rescheduled',
      name: 'resetReattempts',
      javaCode: `
      clearReattemptRequested();
      clearReattempts();
      `
    }
  ],

  actions: [
    {
      name: 'disable',
      isAvailable: function() {
        return this.enabled;
      },
      code: function(X) {
        var cron = this.clone();
        cron.enabled = false;

        this.cronDAO.put(cron).then(req => {
          this.cronDAO.cmd(this.AbstractDAO.PURGE_CMD);
          this.cronDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          X.notify(this.SUCCESS_DISABLED, '', this.LogLevel.INFO, true);
        }, e => {
          this.throwError.pub(e);
          X.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'enable',
      isAvailable: function() {
        return ! this.enabled;
      },
      code: function(X) {
        var cron = this.clone();
        cron.enabled = true;

        this.cronDAO.put(cron).then(req => {
          this.cronDAO.cmd(this.AbstractDAO.PURGE_CMD);
          this.cronDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          X.notify(this.SUCCESS_ENABLED, '', this.LogLevel.INFO, true);
        }, e => {
          this.throwError.pub(e);
          X.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    }
  ]

});
