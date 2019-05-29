foam.CLASS({
  package: 'net.nanopay.alarming',
  name: 'AlarmConfig',

  documentation: 'A config for OM on when an alarm should be raised',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'What this alarm config is for'
    },
    {
      class: 'String',
      name: 'sendName',
      documentation: 'Name of the OM before a request is sent'
    },
    {
      class: 'String',
      name: 'receiveName',
      documentation: 'Name of the OM after a request is received'
    },
    {
      class: 'String',
      name: 'timeOutName',
      documentation: 'Name of the OM after a request has timed out'
    },
    {
      class: 'Int',
      name: 'alarmValue',
      documentation: 'When the alarm should trigger, 0 - 100 number to represent mismatch percentage'
    },
    {
      class: 'Int',
      name: 'cycleTime',
      value: 1000,
      documentation: 'Time in ms between runs'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.alarming.MonitorType',
      name: 'monitorType'
    }
  ],

});
