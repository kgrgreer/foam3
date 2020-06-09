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
  package: 'net.nanopay.account.ui.addAccountModal.components',
  name: 'ModalTitleBar',
  extends: 'foam.u2.Element',

  documentation: 'Modal Title Bar that holds the title along with the back and close actions.',

  imports: [
    'subStack',
    'closeDialog'
  ],

  css: `
    ^ {
      padding: 16px 24px;
    }

    ^elementAlignment {
      /* Probably change to flexbox during refinement */
      display: inline-block;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'isBackEnabled',
      expression: function(subStack$pos, forceHideBack) {
        // If forceHideBack is enforced, hide back button
        return forceHideBack ? ! forceHideBack : subStack$pos > 0 ;
      }
    },
    {
      class: 'Boolean',
      name: 'forceHideBack'
    },
    {
      class: 'Boolean',
      name: 'forceHideClose'
    },
    {
      class: 'String',
      name: 'title'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.PREVIOUS, { data: this }).addClass(this.myClass('elementAlignment'))
          .show(this.isBackEnabled$)
        .end()
        .start('p').addClass(this.myClass('elementAlignment')).add(this.title$).end()
        .start(this.CLOSE_MODAL).addClass(this.myClass('elementAlignment')).hide(this.forceHideClose$).end();
    }
  ],

  actions: [
    {
      name: 'previous',
      label: 'Back',
      // TODO: There is a bug with this where the action does not hide itself.
      // isAvailable: function(forceHideBack) {
      //   return ! forceHideBack;
      // },
      code: function(X) {
        X.subStack.back();
      }
    },
    {
      name: 'closeModal',
      label: 'Close',
      // TODO: There is a bug with this where the action does not hide itself.
      // isAvailable: function(forceHideClose) {
      //   return ! forceHideClose;
      // },
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
