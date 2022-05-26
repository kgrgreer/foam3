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
    'foam.nanos.auth.Subject'
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
      name: 'schedule',
      of: 'foam.nanos.cron.Schedule',
      view: {
        class: 'foam.u2.view.FObjectView',
        of: 'foam.nanos.cron.SimpleIntervalSchedule'
      }
    },
    {
      class: 'String',
      name: 'objectDAOKey'
    },
    {
      class: 'FObjectProperty',
      name: 'objectToSchedule'
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
