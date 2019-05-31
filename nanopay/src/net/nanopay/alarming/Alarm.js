foam.CLASS({
  package: 'net.nanopay.alarming',
  name: 'Alarm',

  documentation: 'A config for OM on when an alarm should be raised',

  implements: [
    'foam.mlang.Expressions'
  ],

  tableColumns: [
    'name',
    'lastUpdated',
    'isActive',
    'stop',
    'start'
  ],

  requires: [
    'foam.dao.AbstractDAO',
    'net.nanopay.alarming.AlarmReason',
    'net.nanopay.alarming.MonitoringReport',
    'net.nanopay.alarming.AlarmReason'
  ],

  imports: [
    'alarmDAO',
    'monitoringReportDAO'
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
        let self = this;
        this.isActive = false;
        this.reason = this.AlarmReason.NONE;
        this.alarmDAO.put(this);
        this.alarmDAO.cmd(this.AbstractDAO.RESET_CMD);

        this.monitoringReportDAO.find(this.EQ(this.MonitoringReport.NAME, this.name)).then((monitorReport)=> {
          monitorReport.startCount = 0;
          monitorReport.endCount = 0;
          monitorReport.timeoutCount = 0;
          self.monitoringReportDAO.put(monitorReport);
        });
      }
    },
    {
      name: 'start',
      label: 'Start Alarm',
      code: function() {
        this.isActive = true;
        this.reason = this.AlarmReason.MANUAL;
        this.alarmDAO.put(this);
        this.alarmDAO.cmd(this.AbstractDAO.RESET_CMD);
      }
    }
  ]
});
