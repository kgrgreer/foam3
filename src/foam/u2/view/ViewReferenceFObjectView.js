/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ViewReferenceFObjectView',
  extends: 'foam.u2.View',

  documentation: `A view to display nested approvable FObjects.`,

  imports: [
    'stack'
  ],

  requires: [
    'foam.u2.ControllerMode',
    'foam.u2.detail.SectionedDetailView'
  ],

  messages: [
    { name: 'BACK_LABEL', message: 'Back'}
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.core.FObject',
      name: 'data'
    },
    {
      class: 'Class',
      name: 'of'
    }
  ],

  methods: [
    function initE() {
      var x = this.__subContext__.createSubContext({
        controllerMode: this.ControllerMode.VIEW
      });
       
      this.addClass(this.myClass())
        .startContext({ data: this })
          .tag(this.BACK, {
            buttonStyle: foam.u2.ButtonStyle.LINK,
            themeIcon: 'back',
            label: this.BACK_LABEL
          })
        .endContext()
        .tag(this.SectionedDetailView.create({ data: this.data, of: this.of }, x));
    }
  ],
  actions: [
    {
      name: 'back',
      code: function() {
        this.stack.back();
      }
    }
  ]
});
