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
    'foam.dashboard.model.VisualizationSize',
    'foam.u2.stack.StackBlock'
  ],

  imports: [
    'stack'
  ],

  exports: [
    'onClick'
  ],

  css: `
    ^ {
      display: grid;
      grid-template-rows: 2em 1fr;
    }
    ^title-container {
      display: flex;
      justify-content: space-between;
    }
    ^entry-container {
      display: flex;
      gap: 30px;
      padding-bottom: 1.5vh;
      overflow: scroll;
    }
    ^ .foam-u2-ActionView-viewMoreAction {
      padding-top: 0;
    }
    ^entry-container > * {
      max-width: 400px;
      max-height: 200px;
    }
  `,

  properties: [
    'title',
    'actionView',
    'data',
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
        .start().addClass(this.myClass('title-container'))
          .start().addClass('h500').add(self.title).end()
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
            .forEach(currentValues, function(data) {
              self.data = data;
              e.tag(self.citationView, { data : data });
            })
            .callIf(self.actionView, function() {
              e.tag(self.actionView);
            });
        }));
    }
  ],

  listeners: [
    function onClick() {
      this.stack.push(this.StackBlock.create({
        view: {
          class: foam.comics.v2.DAOSummaryView,
          config: foam.comics.v2.DAOControllerConfig.create({ daoKey: 'cardAccountDAO' }, this),
          data: this.data
        }, parent: this.__subContext__.createSubContext({ currentControllerMode: 'view' })
      }));
    }
  ]
});
