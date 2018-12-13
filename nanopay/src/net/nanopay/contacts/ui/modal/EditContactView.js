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
      position: relative;
      padding: 24px;
      padding-top: 0;
    }
    ^ .title {
      margin: 0;
      padding: 24px;
      font-size: 24px;
      font-weight: 900;
    }
    ^ .spinner-container {
      background-color: #ffffff;
      width: 100%;
      height: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
      z-index: 1;
    }
    ^ .spinner-container-center {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      height: 100%;
    }
    ^ .spinner-container .net-nanopay-ui-LoadingSpinner img {
      width: 50px;
      height: 50px;
    }
    ^ .spinner-text {
      font-weight: normal;
      font-size: 12px;
      color: rgba(9, 54, 73, 0.7);
    }
    ^ .option-container {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;

      padding: 24px;
      box-sizing: border-box;
      background-color: #fafafa;
    }
    ^ .option-container .net-nanopay-ui-ActionView-editAccount {
      background-color: white;
      border: 1px solid %SECONDARYCOLOR%;
      color: %SECONDARYCOLOR%;
      margin-right: 16px;
    }
    ^ .option-container .net-nanopay-ui-ActionView-editAccount:hover {
      background-color: white;
      border: 1px solid #4d38e1;
      color: %SECONDARYCOLOR%;
    }
    ^ .option-container .net-nanopay-ui-ActionView-keepAccount {

    }
  `,

  messages: [
    { name: 'TITLE', message: 'Edit Contact' },
    { name: 'SUBTITLE1', message: 'Would you like to add a Bank Account to this Contact?' },
    { name: 'SUBTITLE2', message: 'The Contact you wish to edit has a Bank Account, would you like to: ' },
    { name: 'CONNECTING', message: 'Connecting...' },
    { name: 'EDIT_ERROR', message: 'There was an unexpected errro, please try again' },
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isConnecting',
      value: false
    },
    {
      class: 'Boolean',
      name: 'hasAccount'
    },
    {
      class: 'Boolean',
      name: 'canDelete'
    },
    {
      class: 'Boolean',
      name: 'toCloseB'
    },
    {
      name: 'loadingSpinner',
      factory: function() {
        return this.LoadingSpinner.create();
      }
    },
  ],

  methods: [
    function init() {
      this.SUPER();

      if ( this.wizard.data.bankAccount ) {
        // contact has a bankAccount
        this.hasAccount = true;
        this.isConnecting = true;

        // Check if we have the option to delete/edit bank.
        try {
          this.invoiceDAO.where(
            this.OR(
              this.EQ(
                this.Invoice.ACCOUNT,
                this.wizard.data.bankAccount),
              this.EQ(
                this.Invoice.DESTINATION_ACCOUNT,
                this.wizard.data.bankAccount),
            )
          ).select(this.COUNT()).then((count) => {
            if ( count && count.value == 0 ) {
              this.canDelete = true;
            }
            this.isConnecting = false;
          });
        } catch (error) {
          this.notify(error.message || 'Internal error please try again.', 'error');
        }
      } else {
        // Contact does not have a bankAccount
        // Immediately redirect to contactBankingOption.js
        this.toCloseB = true;
      }
    },

    function initE() {
      if ( this.toCloseB ) {
        this.toCloseF();
      } else {
        this.addClass(this.myClass())
        .start('p').addClass('title').add(this.TITLE).end()
          .start().addClass('content')
          .start().addClass('spinner-container').show(this.isConnecting$)
            .start().addClass('spinner-container-center')
              .add(this.loadingSpinner)
              .start('p').add(this.CONNECTING).addClass('spinner-text').end()
            .end()
          .end()
          .start().add(this.SUBTITLE1).show(! this.hasAccount).end()
          .start().add(this.SUBTITLE2).show(this.hasAccount).end()
            .start().addClass('option-container')
              .tag(this.EDIT_ACCOUNT)
              .tag(this.KEEP_ACCOUNT)
            .end()
        .end();
      }
    },

    function toCloseF() {
      this.closeDialog();
      this.pushToId('bankOption');
    }
  ],

  actions: [
    // edit = true - means showing fields are filled in. - also this feature is not enabled with a boolean but if ((wizard.data = selected contact) != null)
    {
      name: 'editAccount',
      label: 'Edit bank account',
      code: function(X) {
        this.isConnecting = false;
        // redirect to edit contactInfo - X.viewData.isBankingProvided = true; edit = true;
        try {
          X.accountDAO.find(this.wizard.data.bankAccount).then(
            (account) => {
              X.viewData.contactAccount = account;
              X.viewData.isBankingProvided = true;
              this.isConnecting = true;
              X.pushToId('information');
            }
          );
        } catch (error) {
          this.notify(this.EDIT_ERROR, 'error');
        }
      }
    },
    {
      name: 'keepAccount',
      label: 'Keep existing account',
      code: function(X) {
        // redirect to edit contactInfo - X.viewData.isBankingProvided = false; edit = true;
        X.viewData.isBankingProvided = false;
        X.pushToId('information');
      }
    }
  ]

});
