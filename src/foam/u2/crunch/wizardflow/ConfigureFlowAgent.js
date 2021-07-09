/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'ConfigureFlowAgent',
  implements: [ 'foam.core.ContextAgent' ],

  documentation: `
    Exports pushView and popView, either delegates to the stack or creates
    popups depending on the configuration. Additionally, exports an FObject for
    wizardlet property subscriptions to detach on.
  `,

  imports: [
    'stack'
  ],

  exports: [
    'pushView',
    'popView',
    'wizardCloseSub'
  ],

  requires: [
    'foam.u2.dialog.Popup'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'wizardCloseSub',
      of: 'foam.core.FObject',
      factory: function() {
        return foam.core.FObject.create();
      }
    },
    {
      name: 'popupMode',
      class: 'Boolean',
      value: true
    },
    {
      name: 'pushView',
      class: 'Function',
      expression: function () {
        return this.popupMode
          ? (viewSpec, onClose) => {
            ctrl.add(
              this.Popup.create({
                closeable: viewSpec.closeable ? viewSpec.closeable : false,
                onClose: onClose
              })
                .tag(viewSpec)
            );
          }
          : viewSpec => {
            this.stack.push(viewSpec, this);
          }
          ;
      }
    },
    {
      name: 'popView',
      class: 'Function',
      expression: function () {
        var self = this;
        return this.popupMode
          ? function (x) {
            x.closeDialog();
          }
          : function (x) {
            self.stack.back();
          }
          ;
      }
    }
  ],

  methods: [
    async function execute () {}
  ]
});
