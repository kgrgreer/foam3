/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'Schedulable',
  extends: 'foam.nanos.cron.Cron',

  mixins: [
    'foam.nanos.auth.CreatedAwareMixin',
    'foam.nanos.auth.CreatedByAwareMixin'
  ],

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.dao.DAO',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.Subject',
    'java.util.Date'
  ],

  requires: [
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.script.ScriptEvent'
  ],

  sections: [
    {
      name: '_defaultSection',
      order: 1,
      permissionRequired: true
    },
    {
      name: 'scriptEvents',
      order: 2,
      permissionRequired: true
    },
    {
      name: 'summary',
      title: 'Summary',
      order: 3
    },
    {
      name: 'scheduling',
      title: 'Details',
      order: 4
    },
    {
      name: 'history',
      title: 'History',
      order: 5
    }
  ],

  properties: [
    {
      name: 'daoKey',
      value: 'schedulableDAO'
    },
    {
      class: 'String',
      name: 'eventDaoKey',
      value: 'schedulableEventDAO'
    },
    {
      name: 'scheduledTime',
      storageTransient: false
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.cron.Schedule',
      name: 'schedule',
      label: '',
      section: 'scheduling',
      postSet: function(_, v) {
        if ( ! v ) return;
        this.frequency = v.frequency;
        this.startDate = v.startDate;
        this.endsOn = v.endsOn;
      },
      factory: function() {
        var ret = foam.nanos.cron.SimpleIntervalSchedule.create();
        this.SCHEDULE.postSet(null, ret);
        return ret;
      },
      view: function (_, X) {
        return {
          class: 'foam.nanos.cron.SimpleIntervalScheduleView',
          data$: X.data.schedule$
        }
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredEventDAO',
      section: 'history',
      label: '',
      documentation: 'Show a table view of all historic scheduled events',
      factory: function() {
        if ( ! this.eventDaoKey ) return null;

        const E = foam.mlang.ExpressionsSingleton.create({});
        var idPredicate = E.EQ(this.ScriptEvent.OWNER, this.id);
        return this.__subContext__[this.eventDaoKey].where(idPredicate);
      },
      view: function(_, X) {
        var dao = X.data.filteredEventDAO;
        return {
          class: 'foam.comics.v2.DAOBrowserView',
          config: {
            class: 'foam.comics.v2.DAOControllerConfig',
            dao: dao,
            summaryView: {
              class: 'foam.u2.table.TableView',
              columns: [ 'lastRun' ],
              editColumnsEnabled: false,
              disableUserSelection: true
            }
          }
        };
      }
    },
    {
      class: 'String',
      name: 'objectDAOKey'
    },
    {
      class: 'FObjectProperty',
      name: 'objectToSchedule'
    },
    {
      class: 'String',
      name: 'name',
      section: 'summary',
      createVisibility: 'HIDDEN',
      gridColumns: 4,
      order: 1,
      factory: function() {
        return `${this.objectToSchedule?.toSummary()} ${this.objectToSchedule?.toSummary() && this.nextScheduleDate ? '-' : ''} ${this.nextScheduledDate}`;
      }
    },
    {
      class: 'Date',
      name: 'nextScheduledDate',
      section: 'summary',
      createVisibility: 'HIDDEN',
      gridColumns: 4,
      order: 2,
      javaFactory: `
        Date d = getSchedule().getNextScheduledTime(foam.core.XLocator.get(), new Date());
        return d != null ? d : null;
      `
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifeCycleState',
      label: 'Status',
      section: 'summary',
      createVisibility: 'HIDDEN',
      gridColumns: 4,
      order: 3,
      factory: function() {
        var nextScheduledDate_ = this.nextScheduledDate;
        if ( ! nextScheduledDate_ && this.endsOn < new Date() ) {
          return foam.nanos.auth.LifecycleState.DISABLED;
        } else if ( ! nextScheduledDate_ ) {
          return foam.nanos.auth.LifecycleState.PENDING;
        }
        return foam.nanos.auth.LifecycleState.ACTIVE;
      }
    },
    {
      name: 'lastRun',
      label: 'Last Occurrence'
    },
    {
      class: 'Enum',
      of: 'foam.time.TimeUnit',
      name: 'frequency',
      createVisibility: 'HIDDEN',
      transient: true
    },
    {
      class: 'Date',
      name: 'startDate',
      label: 'Start On',
      createVisibility: 'HIDDEN',
      transient: true
    },
    {
      class: 'Date',
      name: 'endsOn',
      visibility: 'HIDDEN',
      transient: true
    }
  ],

  methods: [
    {
      name: 'runScript',
      javaCode: `
        ((Agency) x.get("threadPool")).submit(x, (ContextAgent) this, "");
      `
    },
    {
      name: 'execute',
      javaCode: `
        try {
          ((DAO) x.get(getObjectDAOKey())).put(getObjectToSchedule());
        } catch (Exception e){
          ((foam.dao.DAO) x.get("alarmDAO")).put(new Alarm.Builder(x)
            .setName("Failed to execute schedulable event")
            .setSeverity(foam.log.LogLevel.ERROR)
            .setReason(foam.nanos.alarming.AlarmReason.UNSPECIFIED)
            .setNote(getId() + " " + e.getMessage())
            .build());
        }
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        // not authorized for now
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        isOwnerOrHasPermission(x, this, "read");
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        isOwnerOrHasPermission(x, oldObj, "update");
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        isOwnerOrHasPermission(x, this, "remove");
      `
    },
    {
      name: 'isOwnerOrHasPermission',
      documentation: `
        A user may read, update, or delete a schedule they own.
        A user who has the * permission for schedulable.[operation].* may also perform the
        operation on the schedulable.
      `,
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'foam.core.FObject' },
        { name: 'action', type: 'String' }
      ],
      javaThrows: [ 'foam.nanos.auth.AuthorizationException' ],
      javaCode: `
        Subject subject = (Subject) x.get("subject");
        if ( subject.getUser().getId() == ((CreatedByAware) obj).getCreatedBy() &&
             subject.getRealUser().getId() == ((CreatedByAware) obj).getCreatedByAgent() )
              return;

        AuthService auth = (AuthService) x.get("auth");
        if ( auth.check(x, "schedulabe." + action + ".*") ) return;

        throw new AuthorizationException("You do not have permission to " + action + " this Schedulable");
      `
    }
  ]
});
