/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'GroupByCitationView',
  extends: 'foam.dashboard.view.DashboardCitationView',

  imports: [
    'stack',
    'pushMenu'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.comics.v2.DAOSummaryView',
    'foam.comics.v2.DAOBrowseControllerView',
    'foam.u2.stack.StackBlock'
  ],

  properties: [
    {
      class: 'String',
      name: 'groupByProperty'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.menu.Menu',
      name: 'redirectMenu'
    },
    'of'
  ],

  methods: [
    function render() {
      var self = this;

      this.addClass(this.myClass())
        .on('click', function() {
          // create predicate
          var predicate = self.EQ(self.of.getAxiomByName(self.groupByProperty), self.data[0].name);
          self.redirectMenu.handler.config.searchPredicate = predicate;
          self.pushMenu(self.redirectMenu);
        })
        .start()
          .add(this.data[0].label)
        .end()
        .start()
          .add(this.data[1])
        .end();
    }
  ]
});
