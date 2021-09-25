/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'GroupByDAOTable',
  extends: 'foam.dashboard.view.DAOTable',

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
    {
      name: 'categoryCount',
      factory: function() {
        return new Map();
      }
    }
  ],
  methods: [
    function init() {
      this.data$.dot('dao').sub(this.populateCategoryCount);
    },
    async function render() {
      var self = this;

      await this.populateCategoryCount();

      this
        .addClass(this.myClass())
        .add(this.slot(function(categoryCount) {
          var e = self.E();
          return e
            .addClass(this.myClass())
            .forEach(Array.from(this.categoryCount.entries()), function(ent) {

            // })
          //   .select(self.data$dao, function(obj) {
              e.start()
                .addClass('table-row')
                  // .add(ent[1])
                .start({
                  class: self.citationView,
                  data: ent,
                  groupByProperty: self.groupByProperty,
                  redirectMenu: self.redirectMenu,
                  of: self.data.dao.of
                })
               .end();
           });
        }));
    }
  ],
  listeners: [
    {
      name: 'populateCategoryCount',
      code: async function() {
        var out = await this.data.dao.select();
        for ( v of out.array ) {
          var key = v[this.groupByProperty];
          if ( this.categoryCount.has(key)) {
            var count = this.categoryCount.get(key);
            this.categoryCount.set(key, count + 1);
            continue;
          }
          this.categoryCount.set(key, 1);
        }
      }
    }
  ]
});
