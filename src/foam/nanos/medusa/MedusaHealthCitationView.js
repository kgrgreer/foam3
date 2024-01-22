/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaHealthCitationView',
  extends: 'foam.dashboard.view.DashboardCitationView',

  properties: [
    {
      class: 'Class',
      of: 'foam.nanos.medusa.MedusaHealth'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      value: 'healthDAO'
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
              .add(this.data.id).nbsp()
            .end()
            .start().addClass('float-right')
              .add(this.data.MEDUSA_STATUS)
              .nbsp().nbsp()
              .add(this.data.STATUS)
            .end()
          .end()
          .start().addClass(this.myClass('myline'))
            .start().addClass('float-left')
              .callIfElse(
                this.data.isPrimary,
                function() { this.addClass('p-semiBold').add('PRIMARY') },
                function() { this.add('SECONDARY') })
            .end()
            .start().addClass('float-right')
              .add(this.data.INDEX)
            .end()
          .end()
        .end()
      .endContext();
    }
  ]
})
