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
  name: 'DeleteContactView',
  extends: 'foam.u2.View',

  documentation: 'View for deleting a Contact',

  imports: [
    'notify',
    'user',
  ],

  requires: [
    'foam.log.LogLevel'
  ],

  css: `
    ^ {
      width: 504px;
    }
    ^ h2 {
      margin-top: 0;
    }
    ^ p {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
    }
    ^main {
      padding: 24px;
    }
    ^ .buttons {
      background: #fafafa;
      height: 84px;
      padding: 24px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Delete contact?' },
    { name: 'CONFIRM_DELETE_1', message: 'Are you sure you want to delete ' },
    { name: 'CONFIRM_DELETE_2', message: ' from your contacts list?' },
    { name: 'SUCCESS_MSG', message: 'Contact deleted' },
    { name: 'FAIL_MSG', message: 'Failed to delete contact' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('main'))
          .start('h2')
            .add(this.TITLE)
          .end()
          .start('p')
            .add(`${this.CONFIRM_DELETE_1} '${this.data.organization}' ${this.CONFIRM_DELETE_2}`)
          .end()
        .end()
        .start()
          .addClass('buttons')
          .startContext({ data: this })
            .tag(this.CANCEL, { buttonStyle: 'TERTIARY' })
            .tag(this.DELETE, { isDestructive: true })
          .endContext()
        .end();
    },

    async function deleteContact() {
      try {
        var result = await this.user.contacts.remove(this.data);
        if ( ! result ) throw new Error(this.FAIL_MSG);
        this.notify(this.SUCCESS_MSG, '', this.LogLevel.INFO, true);
      } catch (err) {
        var msg = err && err.message ? err.message : this.FAIL_MSG;
        this.notify(msg, '', this.LogLevel.ERROR, true);
      };
    }
  ],

  actions: [
    {
      name: 'delete',
      label: 'Delete',
      code: function(X) {
        this.deleteContact();
        X.closeDialog();
      }
    },
    {
      name: 'cancel',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
