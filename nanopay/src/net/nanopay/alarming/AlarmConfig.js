foam.CLASS({
  package: 'net.nanopay.alarming',
  name: 'AlarmConfig',

  documentation: 'A config for OM on when an alarm should be raised',

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  imports: [
    'om1minDAO'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO',
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'What this alarm config is for'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'String',
      name: 'preRequest',
      documentation: 'Name of the OM before a request is sent',
      view: function(om1minDAO, X) {
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(candlestick) {
            return [candlestick.key, candlestick.key];
          },
          dao$: X.om1minDAO$,
          placeholder: '--'
        });
      }
    },
    {
      class: 'String',
      name: 'postRequest',
      documentation: 'Name of the OM after a request is received',
      view: function(om1minDAO, X) {
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(candlestick) {
            return [candlestick.key, candlestick.key];
          },
          dao$: X.om1minDAO$,
          placeholder: '--'
        });
      }
    },
    {
      class: 'String',
      name: 'timeOutRequest',
      documentation: 'Name of the OM after a request has timed out',
      view: function(om1minDAO, X) {
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(candlestick) {
            return [candlestick.key, candlestick.key];
          },
          dao$: X.om1minDAO$,
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
      of: 'net.nanopay.alarming.MonitorType',
      name: 'monitorType'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      name: 'alertGroup'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'alertUser'
    },
    {
      class: 'Boolean',
      name: 'sendEmail',
      value: true
    }
  ]
});
