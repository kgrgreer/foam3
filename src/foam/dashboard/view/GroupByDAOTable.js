/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'GroupByDAOTable',
  extends: 'foam.dashboard.view.DAOTable',

  documentation: `
    A DAOTable view that groups and counts dao entries that share the same value for groupByPropertyName.
  `,

  imports: [
    'dashboardController'
  ],

  css: `
    ^no-entry {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    ^ .table-row {
      padding-left: 0px;
      padding-right: 0px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'groupByPropertyName',
      documentation: 'The property by which grouping will be done'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.menu.Menu',
      name: 'redirectMenu',
      documentation: 'The menu that will be pushed when an individual grouping is selected.'
    },
    {
      name: 'noEntriesMessage',
      type: 'foam.box.Message'
    },
    {
      name: 'groupingsCount',
      documentation: `
        A map that stores the possible groups and the number of dao entries that belong to the individual groups.
      `,
      factory: function() {
        return new Map();
      }
    },
    {
      name: 'customizeKey'
    }
  ],
  methods: [
    function init() {
      this.onDetach(this.dashboardController.sub('dashboard', 'update',  this.populateGroupingsCount));
      this.onDetach(this.data$.dot('dao').sub(this.populateGroupingsCount));
    },
    async function render() {
      var self = this;

      await this.populateGroupingsCount();

      this
        .addClass(this.myClass())
        .add(this.slot(function(groupingsCount) {
          var e = self.E();
          return e
            .callIf(groupingsCount.size == 0, function() {
              e.start().addClass(self.myClass('no-entry')).add(self.noEntriesMessage).end();
            })
            .forEach(Array.from(this.groupingsCount.entries()), function(grouping) {
              e.start()
                .addClass('table-row')
                .start({
                  class: self.citationView,
                  data: grouping,
                  groupByPropertyName: self.groupByPropertyName,
                  redirectMenu: self.redirectMenu,
                  dao: self.data.dao,
                  customizeKey: self.customizeKey
                })
              .end();
           });
        }));
    }
  ],
  listeners: [
    {
      name: 'populateGroupingsCount',
      code: async function() {
        var map_ = new Map();
        var out = await this.data.dao.select();
        for ( v of out.array ) {
          var key = v[this.groupByPropertyName];
          if ( map_.has(key)) {
            var count = map_.get(key);
            map_.set(key, count + 1);
            continue;
          }
          map_.set(key, 1);
        }
        this.groupingsCount = map_;
      }
    }
  ]
});
