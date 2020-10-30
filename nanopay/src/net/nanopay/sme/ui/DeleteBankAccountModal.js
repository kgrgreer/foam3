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
  package: 'net.nanopay.sme.ui',
  name: 'DeleteBankAccountModal',
  extends: 'foam.u2.View',

  documentation: 'Export Modal',

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.ui.modal.ModalHeader'
  ],

  imports: [
    'accountDAO',
    'closeDialog',
    'notify'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'account',
      documentation: 'The bank account to delete.'
    }
  ],

  css: `
    ^ {
      width: 448px;
      margin: auto;
    }
    ^ p {
      margin: 0;
      color: #525455;
      font-size: 14px;
    }
    ^inner-container {
      padding: 7px 24px;
      padding-bottom: 24px;
    }
    ^buttons {
      display: flex;
      justify-content: flex-end;
      padding: 16px 23px;
      background-color: #fafafa;
    }
    ^buttons > * {
      margin-left: 24px;
    }
    ^ .transparent-cancel {
      background-color: transparent;
      color: #525455;
      width: auto;
      border: none;
      box-shadow: none;
    }
    ^ .transparent-cancel:hover {
      background-color: transparent;
    }
    ^ .alert-icon {
      display: inline-block;
      vertical-align: bottom;
      width: 20px;
      height: 20px;
      padding-left: 24px;
      padding-bottom: 12px;
      padding-right: 8px;
    }
    ^ .net-nanopay-ui-modal-ModalHeader {
      display: inline-block;
      vertical-align: bottom;

      width: auto;
      height: auto;

      background-color: transparent;
      margin: 0;
      padding-top: 24px;
    }
    ^ .net-nanopay-ui-modal-ModalHeader .foam-u2-ActionView-closeModal {
      display: none;
    }
    ^ .net-nanopay-ui-modal-ModalHeader .title {
      font-size: 24px;
      color: /*%BLACK%*/ #1e1f21;
      font-weight: 900;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin-left: 0;
      line-height: 1.5;
    }
    ^ .foam-u2-ActionView-delete {
      background-color: #f91c1c;
      width: auto;
      padding-left: 20px;
      padding-right: 20px;
    }
    ^ .foam-u2-ActionView-delete:hover {
      background-color: #e31212;
    }
  `,

  messages: [
    {
      name: 'TITLE',
      message: 'Delete bank account'
    },
    {
      name: 'BODY_COPY',
      message: 'Are you sure you want to delete this banking option? You ' +
        'will still be able to view payables and receivables related to this ' +
        'account.'
    },
    {
      name: 'DEFAULT_ERROR_MESSAGE',
      message: 'There was a problem deleting your account. Try again later.'
    },
    {
      name: 'SUCCESS_MESSAGE',
      message: 'Bank account deleted'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .start()
          .start({ class: 'foam.u2.tag.Image', data: 'images/ic-overdue.svg' }).addClass('alert-icon').end()
          .tag(this.ModalHeader.create({ title: this.TITLE }))
        .end()

        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('inner-container'))
          .start('p').add(this.BODY_COPY).end()
        .end()
        .start()
          .addClass(this.myClass('buttons'))
          .startContext({ data: this })
            .start(this.CANCEL).addClass('transparent-cancel').end()
            .add(this.DELETE)
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function(X) {
        this.closeDialog();
      }
    },
    {
      name: 'delete',
      code: function(X) {
        X.accountDAO
          .remove(this.account)
          .then(() => {
            this.notify(this.SUCCESS_MESSAGE, '', this.LogLevel.INFO, true);
            this.closeDialog();
          })
          .catch((err) => {
            this.notify(err.message || this.DEFAULT_ERROR_MESSAGE, '', this.LogLevel.ERROR, true);
          });
      }
    }
  ]
});
