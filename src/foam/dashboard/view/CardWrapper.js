/**
 * NANOPAY CONFIDENTIAL
 *
 * [2022] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'CardWrapper',
  extends: 'foam.u2.Element',
  mixins: ['foam.nanos.controller.MementoMixin'],

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
  }
  ^titled-container {
    display: grid;
    grid-template-rows: 2em 1fr;
  }
  `,

  properties: [
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
    'obj',
    'mode',
    ['aspectRatio', 'auto']
  ],

  methods: [
    function render() {
      this.initMemento();
      this.addClass(this.myClass())
        .enableClass(this.myClass('titled-container'), this.title)
        .style({ 'aspect-ratio': this.aspectRatio })
        .callIf(!!this.title, function () {
          this.start().addClasses([this.myClass('title'), 'h500']).translate(this.title, this.title).end()
        })
        .tag(this.Card, {
          data: this,
          obj: this.obj
        });
    }
  ],
  listeners: [
    {
      name: 'update',
      isFramed: true,
      code: function() {
        // no-op
      }
    }
  ]
})