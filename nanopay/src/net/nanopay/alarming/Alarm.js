foam.CLASS({
  package: 'net.nanopay.alarming',
  name: 'Alarm',

  documentation: 'A config for OM on when an alarm should be raised',

  tableColumns: [
    'name',
    'lastUpdated',
    'isActive',
    'stop'
  ],

  requires: [
    'foam.dao.AbstractDAO',
    'net.nanopay.alarming.AlarmReason'
  ],

  imports: [
    'alarmDAO'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'What this alarm is for'
    },
    {
      class: 'DateTime',
      name: 'created'
    },
    {
      class: 'DateTime',
      name: 'lastUpdated'
    },
    {
      class: 'Boolean',
      name: 'isActive'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.alarming.AlarmReason',
      name: 'reason'
    }
  ],

  actions: [
    {
      name: 'stop',
      label: 'Stop Alarm',
      code: function() {
        this.isActive = false;
        this.alarmDAO.put(this);
        this.reason = this.AlarmReason.NONE;
        this.alarmDAO.cmd(this.AbstractDAO.RESET_CMD);
      }
    }
  ]
});
