/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'GroupByCitationView',
  extends: 'foam.dashboard.view.DashboardCitationView',
  mixins: ['foam.nanos.controller.MementoMixin'],

  documentation: `
    A citation view that displays a property value and the number of dao entries that share the same value.
  `,

  imports: [
    'translationService'
  ],

  requires: [
    'foam.comics.v2.DAOBrowseControllerView',
    'foam.u2.stack.StackBlock'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      class: 'String',
      name: 'groupByPropertyName'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.menu.Menu',
      name: 'redirectMenu'
    },
    'dao',
    'customizeKey'
  ],

  methods: [
    async function render() {
      this.initMemento();

      var self = this;

      var label = this.customizeKey ? await this.customizeKey(this.data[0]) : this.data[0];
      var count = this.data[1];

      this.addClass(this.myClass())
        .on('click', function() {
          var config = self.redirectMenu.handler.config;
          var propertyValue = self.data[0];

          var predicate = self.EQ(self.dao.of.getAxiomByName(self.groupByPropertyName), propertyValue);
         
          config.searchPredicate = predicate;
          config.browseTitle = self.translationService.getTranslation(foam.locale, `${self.redirectMenu.id}.browseTitle`, self.redirectMenu.handler.config.browseTitle);
          config.dao = self.dao;
          
          self.currentMemento_.head = self.redirectMenu.id;

          self.stack.push(self.StackBlock.create({
            view: {
              class: self.DAOBrowseControllerView,
              data$: self.dao$,
              config: config
            }, parent: self.__subContext__ 
          }));
        })
        .start()
          .add(label)
        .end()
        .start()
          .add(count)
        .end();
    }
  ]
});
