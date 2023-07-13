/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'CronCitationView',
  extends: 'foam.dashboard.view.DashboardCitationView',

  documentation: 'View showing cron jobs inside CronDashboardCard',

  properties: [
    {
      class: 'Class',
      of: 'foam.nanos.cron.Cron'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      value: 'cronJobDAO'
    }
  ],

  methods: [
    function render() {
      var self = this;
      this
        .on('click', function() {
          self.openFilteredListView(self);
        })
      this.addClass(this.myClass());
      this.startContext({ data: this.data, controllerMode: foam.u2.ControllerMode.VIEW })
      .start().addClass(this.myClass('wrapper'))
        .start().addClass(this.myClass('myline'))
          .start().addClass('float-left')
            .add(this.data.STATUS)
          .end()
          .start().addClass('float-right')
            .add(this.data.LAST_RUN)
          .end()
        .end()
        .start().addClass(this.myClass('myline'))
          .add(this.data.ID)
        .end()
      .end()
      .endContext();
    }
  ]
})
//        .startContext({data:this}).tag(this.REDIRECT, {buttonStyle: 'PRIMARY', label:this.buttonText}).endContext()
