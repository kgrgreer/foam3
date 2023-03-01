/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'CardWrapper',
  extends: 'foam.u2.Element',

  imports: [
    'dashboardController'
  ],

  requires: [
    'foam.dashboard.model.VisualizationSize',
    'foam.dashboard.view.Card'
  ],

  css: `
  ^ .foam-dashboard-view-Card {
    border-radius: 22px;
    overflow: hidden;
  }
  ^titled-container {
    display: grid;
    grid-template-rows: 2em 1fr;
  }
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'border',
      factory: function () {
        return this.Card;
      }
    },
    'title',
    'currentView',
    ['viewTitle', 'Dashboard'],
    {
      class: 'FObjectProperty',
      name: 'size',
      factory: function() {
        return this.VisualizationSize.MEDIUM
      }
    },
    'data',
    'obj',
    'mode',
    ['aspectRatio', 'auto']
  ],

  methods: [
    function render() {
      this.addClass(this.myClass())
        .enableClass(this.myClass('titled-container'), this.title)
        .style({ 'aspect-ratio': this.aspectRatio })
        .callIf(!!this.title, function () {
          this.start().addClass(this.myClass('title'), 'h500').translate(this.title, this.title).end()
        })
        .start(this.border, { data: this })
        .tag(this.slot(function(currentView) {
          return foam.u2.ViewSpec.createView(currentView, {
            data$: this.data$ }, this, this.__subSubContext__);
        })).end();
    }
  ],

  listeners: [
    {
      name: 'update',
      code: function() {
        // no-op
      }
    }
  ]
})
