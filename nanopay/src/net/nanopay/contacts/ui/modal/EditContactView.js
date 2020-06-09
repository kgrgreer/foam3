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
  package: 'net.nanopay.contacts.ui.modal',
  name: 'EditContactView',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.ui.LoadingSpinner',
  ],

  imports: [
    'accountDAO',
    'ctrl',
    'invoiceDAO',
    'loadingSpin',
    'notify',
  ],

  css: `
    ^ .content {
      padding: 24px;
    }
    ^ .option-container {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      padding: 24px;
      box-sizing: border-box;
      background-color: #fafafa;
    }
    ^ .option-container button + button {
      margin-left: 8px;
    }
  `,

  messages: [
    { name: 'TITLE_ON_CREATE', message: 'Add Contact' },
    { name: 'TITLE_ON_EDIT', message: 'Edit Contact' },
    { name: 'QUESTION', message: 'Would you like to add a bank account to this contact?' }
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( this.wizard.data.bankAccount ) {
        // Contact has a bank account.
        this.viewData.isBankingProvided = true;
        // this.closeDialog(); // Why is this needed?
        this.pushToId('information');
      }
    },

    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .addClass('content')
          .start('h2').hide(this.wizard.viewData.isEdit)
            .addClass('popUpTitle')
            .add(this.TITLE_ON_CREATE)
          .end()
          .start('h2').show(this.wizard.viewData.isEdit)
            .addClass('popUpTitle')
            .add(this.TITLE_ON_EDIT)
          .end()
          .start('p')
            .add(this.QUESTION)
          .end()
        .end()
        .start()
          .addClass('option-container')
          .tag(this.NO)
          .tag(this.YES)
        .end();
    }
  ],

  actions: [
    {
      name: 'no',
      code: function(X) {
        X.viewData.isBankingProvided = false;
        X.pushToId('information');
      }
    },
    {
      name: 'yes',
      code: function(X) {
        X.viewData.isBankingProvided = true;
        X.pushToId('information');
      }
    }
  ]

});
