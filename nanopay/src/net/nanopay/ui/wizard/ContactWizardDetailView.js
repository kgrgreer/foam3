/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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
  package: 'net.nanopay.ui.wizard',
  name: 'ContactWizardDetailView',
  extends: 'foam.u2.View',

  imports: [
    'ctrl',
    'stack'
  ],

  requires: [
    'foam.u2.dialog.Popup',
    'net.nanopay.sme.ui.MenuRedirectSMEModalView',
  ],

  css: `
    .wizard {
      display: flex;
      flex-direction: column;
      width: 540px;
      max-height: 80vh;
      overflow-y: scroll;
    }
    .section-container {
      padding: 24px 24px 32px;
      max-height: 570px;
      overflow-y: scroll;
    }
    .foam-u2-tag-Input, .foam-u2-view-StringView {
      width: 100%;
    }
    .foam-u2-CheckBox-label span {
      color: /*%BLACK%*/ #1e1f21;
      font-size: 14px;
      line-height: 1.5;
    }
    .button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 84px;
      background-color: #fafafa;
      padding: 0 24px 0;
    }
    .foam-u2-ActionView-tertiary:focus:not(:hover),
    .foam-u2-ActionView-primary:focus:not(:hover) {
      border-color: transparent !important;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      name: 'model_',
      expression: function(model) {
        return (foam.lookup(model)).create({}, this);
      }
    },
    {
      class: 'String',
      name: 'model'
    },
    {
      class: 'String',
      name: 'modelName',
      expression: function(model) {
        var array = model.split(".");
        return array[array.length - 1];
      }
    },
    {
      class: 'Function',
      name: 'onClose',
      documentation: 'Callback function to be passed on to Popup.'
    },
    {
      class: 'Boolean',
      name: 'isEdit',
      documentation: 'isEdit property to be passed to the WizardView'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.start().addClass(this.myClass())
        .add(this.slot((data) => {
          if ( !! data ) {
            return self.Popup.create({ onClose: self.onClose }, self)
              .startContext({ controllerMode: self.controllerMode })
                .tag({
                  class: `net.nanopay.contacts.ui.${self.modelName}WizardView`,
                  data$: self.data$,
                  isEdit: self.isEdit
                })
              .endContext();
          }
          return self.MenuRedirectSMEModalView.create({
            menu: 'mainmenu.contacts',
            view: {
              class: `net.nanopay.contacts.ui.${self.modelName}WizardView`,
              data: self.model_
            }
          });
        }))
      .end()
    }
  ]
});
