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
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.Subject',

    'java.util.Date'
  ],

  imports: [
    'addCommas'
  ],

  requires: [
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.script.ScriptEvent'
  ],

  tableColumns: [
    'name',
    'amount',
    'frequency',
    'startDate',
    'lastRun',
    'lifeCycleState'
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
      factory: function(){
        return foam.nanos.cron.SimpleIntervalSchedule.create();
      },
      view: function (_, X){
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
      label: 'Scheduled Event History',
      documentation: 'Show a table view of all historic scheduled events',
      factory: function() {
        if ( ! this.eventDaoKey ) return;

        const E = foam.mlang.ExpressionsSingleton.create({});
        var idPredicate = E.EQ(this.ScriptEvent.OWNER, this.id);
        var datePredicate = E.LT(this.ScriptEvent.LAST_RUN, new Date());

        return this.__subContext__[this.eventDaoKey].where(datePredicate)
                                                    .where(idPredicate);
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
      name: 'objectToSchedule',
      createVisibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'name',
      section: 'summary',
      createVisibility: 'HIDDEN',
      gridColumns: 4,
      order: 1
    },
    {
      class: 'Date',
      name: 'nextScheduledDate',
      section: 'summary',
      createVisibility: 'HIDDEN',
      gridColumns: 4,
      order: 2,
      javaFactory: `
        Date d = getSchedule().getNextScheduledTime(getX(), new Date());
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
        if (
          ! this.objectToSchedule ||
          ! this.objectToSchedule.lifecycleState ||
          ! this.objectToSchedule.lifecycleState.name
        ) return;
        return this.objectToSchedule.lifecycleState.name;
      }
    },
    {
      name: 'lastRun',
      label: 'Last Occurrence'
    },
    {
      class: 'UnitValue',
      name: 'amount',
      factory: function() {
        if ( ! this.objectToSchedule || ! this.objectToSchedule.sourceAmount ) return;
        return this.objectToSchedule.sourceAmount;
      },
      tableCellFormatter: function(amount, X) {
        var formattedAmount = amount/100;
        this
        .add('$', X.addCommas(formattedAmount.toFixed(2)));
      }
    },
    {
      class: 'Enum',
      of: 'foam.time.TimeUnit',
      name: 'frequency',
      factory: function() {
        if ( ! this.schedule || ! this.schedule.frequency ) return;
        return this.schedule.frequency;
      }
    },
    {
      class: 'Date',
      name: 'startDate',
      label: 'Start On',
      factory: function() {
        if ( ! this.schedule || ! this.schedule.startDate ) return;
        return this.schedule.startDate;
      }
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
