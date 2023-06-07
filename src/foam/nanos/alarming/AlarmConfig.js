/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AlarmConfig',

  documentation: 'A config for OM on when an alarm should be raised',

  implements: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.medusa.Clusterable'
  ],

  imports: [
    'omNameDAO'
  ],

  ids: ['name'],

  properties: [
    {
      documentation: 'What this alarm config is for',
      class: 'String',
      name: 'name',
      visibility: 'RO',
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'Enum',
      of: 'foam.log.LogLevel',
      name: 'severity',
      value: 'WARN'
    },
    {
      class: 'String',
      name: 'preRequest',
      documentation: 'Name of the OM before a request is sent',
      view: function(omNameDAO, X) {
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(omName) {
            return [omName.name, omName.name];
          },
          dao$: X.omNameDAO$,
          placeholder: '--'
        });
      }
    },
    {
      class: 'String',
      name: 'postRequest',
      documentation: 'Name of the OM after a request is received',
      view: function(omNameDAO, X) {
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(omName) {
            return [omName.name, omName.name];
          },
          dao$: X.omNameDAO$,
          placeholder: '--'
        });
      }
    },
    {
      class: 'String',
      name: 'timeOutRequest',
      documentation: 'Name of the OM after a request has timed out',
      view: function(omNameDAO, X) {
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(omName) {
            return [omName.name, omName.name];
          },
          dao$: X.omNameDAO$,
          placeholder: '--'
        });
      }
    },
    {
      class: 'Int',
      name: 'alarmValue',
      documentation: 'Percentage of # of response received / # of send requests needed to trigger an alarm.',
      value: 75
    },
    {
      class: 'Int',
      name: 'timeoutValue',
      documentation: 'Percentage of # of timeout / # of sent requests needed to trigger an alarm.',
      value: 10
    },
    {
      class: 'Int',
      name: 'cycleTime',
      value: 60000,
      documentation: 'Time in ms between runs'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.alarming.MonitorType',
      name: 'monitorType'
    },
    {
      // deprecated - replaced by Notificaiton
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      name: 'alertGroup',
      menuKeys: ['admin.groups']
    },
    {
      // deprecated - replaced by Notificaiton
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'alertUser'
    },
    {
      // deprecated - replaced by Notificaiton
      class: 'Boolean',
      name: 'sendEmail',
      label: 'Notify',
      value: true
    },
    {
      class: 'Boolean',
      name: 'manual',
      value: false
    },
    {
      class: 'Boolean',
      name: 'clusterable',
      value: false
    },
    {
      class: 'Boolean',
      name: 'useCCOMLogger',
      documentation: 'Indicates whether this alarm is based on CCOMLogger (cross server), otherwise OMLogger (single server)',
      value: false
    }
  ]
});
