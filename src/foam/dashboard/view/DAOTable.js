/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'DAOTable',
  extends: 'foam.u2.Element',
  mixins: ['foam.nanos.controller.MementoMixin'],
  requires: [
    'foam.dashboard.view.DashboardCitationView',
    'foam.comics.v2.DAOBrowseControllerView',
    'foam.u2.stack.StackBlock'
  ],
  imports: [
    'dashboardController',
    'stack'
  ],

  css: `
    ^ {
      position: relative;
      height: 100%;
    }
    ^center {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    ^ .table-row:hover {
      background: /*%GREY5%*/ #f5f7fa;
      cursor: pointer;
    }
    ^ .table-row {
      padding-left: 20px;
      padding-right: 20px;
    }
    ^ div.table-row:last-child div {
      border-bottom: none;
    }
    ^ .view-more button {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 60px;
      max-height: 60px;
    }
    ^ .view-more button:hover {
      background: /*%GREY5%*/ #f5f7fa;
      cursor: pointer;
    }
    ^scroll {
      max-height: 528px;
      overflow-y: auto;
    }
  `,

  properties: [
    {
      name: 'citationView',
      factory: function() {
        return this.DashboardCitationView;
      }
    },
    {
      class: 'Boolean',
      name: 'viewMore',
      documentation: `
        If true, displays a button at the butttom of the table that redirects to a
        full TableView of the given dao. If false, the Table will default to scroll.
      `,
      postSet: function() {
        if ( this.viewMore ) this.limit = 5;
      }
    },
    {
      class: 'Array',
      name: 'currentValues',
      documentation: `
        A list of objects currently displayed in the Table. This list is used as a reference to prevent
        the it from re-rendering the table with the same data.
      `,
      value: []
    },
    {
      class: 'String',
      name: 'emptyTitle'
    },
    {
      class: 'String',
      name: 'emptySubTitle'
    },
    'dao',
    ['limit', 5],
    'mode'
  ],

  methods: [
    function init() {
      if ( this.dashboardController ) {
        this.onDetach(this.dashboardController.sub('dashboard', 'update', this.fetchValues));
      }
    },
    function render() {
      var self = this;
      this.fetchValues();
      this
        .addClass(this.myClass())
        .callIf(!self.viewMore, function() {
          self.addClass(self.myClass('scroll'));
        })
        .add(this.slot(function(currentValues) {
          var e = self.E();
          return e
            .callIf(currentValues.length == 0, function() {
              e.start().addClass(self.myClass('center'))
                .start().addClass('p-semiBold').translate(self.emptyTitle, self.emptyTitle,).end()
                .start().addClass('p').translate(self.emptySubTitle, self.emptySubTitle).end()
              .end();
            })
            .forEach(currentValues, function(obj) {
              e.start().addClass('table-row')
                .start({
                  class: self.citationView,
                  data: obj
                })
               .end();
           })
           .callIf(self.viewMore && currentValues.length >= self.limit, function() {
              e.start()
              .addClass('view-more')
              .startContext({data: self})
                .tag(self.VIEW_MORE_ACTION, {
                  buttonStyle: foam.u2.ButtonStyle.UNSTYLED
                })
              .endContext()
            .end();
           })
        }));
    }
  ],

  actions: [
    {
      name: 'viewMoreAction',
      label: 'View more activities',
      code: function() {
        this.stack.push(this.StackBlock.create({
          view: {
            class: this.DAOBrowseControllerView,
            data: this.__subContext__[this.dao],
          }, parent: this.__subContext__ 
        }));
      }
    }
  ],

  listeners: [
    {
      name: 'fetchValues',
      code: function() {
        var self = this;
        self.__subContext__[self.dao].limit(self.limit).select().then((objects) => {
          var fetchedValues = objects.array;
          if ( JSON.stringify(self.currentValues.map((o) => o.id)) != JSON.stringify(fetchedValues.map((o) => o.id)) ) {
            self.currentValues = fetchedValues;
          }
        });
      }
    }
  ]
});
