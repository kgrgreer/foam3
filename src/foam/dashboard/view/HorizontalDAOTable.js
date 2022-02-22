/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'HorizontalDAOTable',
  extends: 'foam.dashboard.view.DAOTable',

  requires: [
    'foam.dashboard.model.VisualizationSize'
  ],

  css: `
    ^ {
      width: 100%;
      height: auto;
    }
    ^title-container {
      display: flex;
      justify-content: space-between;
    }
    ^entry-container {
      display: flex;
    }
    ^ .foam-u2-ActionView-viewMoreAction {
      padding-top: 0;
    }
    ^ .foam-dashboard-view-Card {
      margin-right: 16px;
    }
  `,

  constants: [
    {
      name: 'SIZES',
      value: {
        TINY:    ['-', 100],
        SMALL:   ['-', 150],
        SMEDIUM: ['-', 200],
        MEDIUM:  ['-', 277],
        LMEDIUM: ['-', 300],
        LARGE:   ['-', 400],
        XLARGE:  ['-', 500],
      }
    }
  ],

  properties: [
    'title',
    'actionView',
    ['limit', 3],
    {
      class: 'FObjectProperty',
      name: 'size',
      factory: function() {
        return this.VisualizationSize.MEDIUM
      }
    },
    {
      name: 'viewMoreLabel',
      value: 'Show all'
    }
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
        .style({
          width: 'inherit',
          height: this.slot(function(size) {
            return ( this.SIZES[size.name][1] + 'px' );
          })
        })
        .start().addClass(this.myClass('title-container'))
          .start().addClass('h500').style({ 'margin-bottom': '16px' }).add(self.title).end()
          .start()
            .startContext({data: self})
              .tag(self.VIEW_MORE_ACTION, {
                buttonStyle: foam.u2.ButtonStyle.UNSTYLED,
                label: self.viewMoreLabel
              })
            .endContext()
          .end() 
        .end()
        .add(this.slot(function(currentValues) {
          var e = self.E();
          return e.addClass(self.myClass('entry-container'))
            .callIf(currentValues.length == 0, function() {
              e.start().addClass(self.myClass('center'))
                .start().addClass('p-semiBold').translate(self.emptyTitle, self.emptyTitle,).end()
                .start().addClass('p').translate(self.emptySubTitle, self.emptySubTitle).end()
              .end();
            })
            .forEach(currentValues, function(obj) {
              e.tag(self.citationView, { obj: obj });
           })
           .callIf(self.actionView, function() {
             e.tag(self.actionView);
           })
        }));
    }
  ]
});
