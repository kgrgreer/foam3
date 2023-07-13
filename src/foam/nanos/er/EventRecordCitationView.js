/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.er',
  name: 'EventRecordCitationView',
  extends: 'foam.dashboard.view.DashboardCitationView',

  properties: [
    {
      class: 'Class',
      of: 'foam.nanos.er.EventRecord'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      value: 'eventRecordDAO'
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
              .add(this.data.SEVERITY)
            .end()
            .start().addClass('float-right')
              .add(this.data.EVENT)
            .end()
          .end()
          .start().addClass(this.myClass('myline'))
            .start()
              .add(this.data['message'])
            .end()
          .end()
        .end()
      .endContext();
    }
  ]
})
