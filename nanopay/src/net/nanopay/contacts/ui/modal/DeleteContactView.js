foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'DeleteContactView',
  extends: 'foam.u2.Controller',

  documentation: 'View for deleting a Contact',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.contacts.Contact',
    'net.nanopay.invoice.model.Invoice',
  ],

  imports: [
    'accountDAO',
    'ctrl',
    'invoiceDAO',
    'user',
  ],

  css: `
    ^ {
      max-height: 80vh;
      overflow: auto;
    }
    ^ .container {
       width: 570px;
    }
    ^ .innerContainer {
      width: 540px;
      margin: 10px;
      padding-bottom: 112px;
    }
    ^ .popUpTitle {
      width: 198px;
      height: 40px;
      font-family: Roboto;
      font-size: 14px;
      line-height: 40.5px;
      letter-spacing: 0.2px;
      text-align: left;
      color: #ffffff;
      margin-left: 20px;
      display: inline-block;
    } 
    ^ .popUpHeader {
      width: 100%;
      height: 6%;
      background-color: %PRIMARYCOLOR%;
    } 
    ^ .styleMargin { 
      margin-top: 8%;
      text-align: right;
      position: absolute;
      bottom: 0px;
      width: calc(100% - 65px);
    }
    ^ .net-nanopay-ui-ActionView-saveButton {
      border-radius: 4px;
      background-color: %SECONDARYCOLOR%;
      color: white;
      width: 100%;
      vertical-align: middle;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    ^ .net-nanopay-ui-ActionView-saveButton:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .net-nanopay-ui-ActionView-deleteButton {
      border-radius: 4px;
      background-color: %SECONDARYCOLOR%;
      color: white;
      width: 100%;
      vertical-align: middle;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    ^ .net-nanopay-ui-ActionView-deleteButton:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .net-nanopay-ui-ActionView-redDeleteButton {
      border-radius: 4px;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      background: #f91c1c;
      color: white;
      vertical-align: middle;
    }
    ^ .net-nanopay-ui-ActionView-redDeleteButton:hover {
      background: #f91c1c;
      opacity: 0.9;
    }
    ^ .net-nanopay-ui-ActionView-cancelDeleteButton {
      border-radius: 2px;
      background: none;
      color: #525455;
      vertical-align: middle;
    }
    ^ .net-nanopay-ui-ActionView-cancelDeleteButton:hover {
      opacity: 0.9;
      background: none;
      color: #525455;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Delete contact?' },
    { name: 'CONFIRM_DELETE_1', message: 'Are you sure you want to delete ' },
    { name: 'CONFIRM_DELETE_2', message: ' from your contacts list?' },
    { name: 'SUCCESS_MSG', message: 'Contact deleted' },
    { name: 'FAIL_MSG', message: 'Deleting the Contact failed: ' },
    { name: 'NO_DELETE_MSG', message: 'The contact you selected is associated with an Invoice. Unfortunetly we can not delete this Contact.' }
  ],

  properties: [
    'contact'
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .start()
            .addClass('container')
            .start()
              .addClass('popUpHeader')
              .start()
                .add(this.TITLE)
                .addClass('popUpTitle')
              .end()
            .end()
            .start()
              .addClass('innerContainer')
              .addClass('delete')
              .add(`${this.CONFIRM_DELETE_1} '${this.contact.organization}' ${this.CONFIRM_DELETE_2}`)
            .end()
            .start()
              .startContext()
              .addClass('styleMargin')
              .add(this.CANCEL_DELETE_BUTTON)
              .add(this.RED_DELETE_BUTTON)
             .endContext()
            .end()
          .end()
        .end();
    },

    function deleteContact() {
      try {
        if ( this.contact.bankAccount ) {
          try {
            this.invoiceDAO.where(
              this.OR(
                this.EQ(
                  this.Invoice.ACCOUNT,
                  this.contact.bankAccount),
                this.EQ(
                  this.Invoice.DESTINATION_ACCOUNT,
                  this.contact.bankAccount),
              )
            ).select(this.COUNT()).then((count) => {
              if ( count && count.value != 0 ) {
                this.notify(this.NO_DELETE_MSG, 'error');
              }
            });
          } catch (error) {
            this.notify(error.message || 'Internal error please try again.', 'error');
          }
          this.accountDAO.remove(this.contact.bankAccount);
        }
        this.user.contacts.remove(this.contact).then((result) => {
          if ( ! result ) throw new Error();
          ctrl.add(this.NotificationMessage.create(
            { message: this.SUCCESS_MSG }));
        });
      } catch (error) {
        if ( error.message ) {
          ctrl.add(this.NotificationMessage.create(
            { message: this.FAIL_MSG + error.message, type: 'error' }));
          return;
        }
        ctrl.add(this.NotificationMessage.create(
          { message: this.FAIL_MSG, type: 'error' }));
      };
    }
  ],

  actions: [
    {
      name: 'redDeleteButton',
      label: 'Delete',
      code: function(X) {
        this.deleteContact();
        X.closeDialog();
      }
    },
    {
      name: 'cancelDeleteButton',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
