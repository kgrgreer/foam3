foam.CLASS({
  package: 'net.nanopay.bank.ui.addUSBankModal',
  name: 'AddUSBankModalWizard',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  documentation: 'This is the main Add American Bank WizardModal.',

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.USBankAccount'
  ],

  exports: [
    'bank',
    'isConnecting',
    'notify',
    'onComplete'
  ],

  imports: [
    'user',
    'X'
  ],

  css: `
    ^ .field-label {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    ^ .foam-u2-tag-Input {
      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
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
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'isConnecting',
      value: false
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.USBankAccount',
      name: 'bank',
      factory: function() {
        return this.USBankAccount.create({
          owner: this.user.id,
          status: this.BankAccountStatus.VERIFIED
        });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.PlaidResponseItem',
      name: 'plaidResponseItem'
    },
    'onDismiss',
    'onComplete'
  ],

  methods: [
    function init() {
      console.log(this.plaidResponseItem);
      this.SUPER();
      var self = this;
      this.viewData.user = this.user;
      this.onDetach(function() {
        if ( self.onDismiss ) self.onDismiss();
      });
      if ( this.plaidResponseItem && this.plaidResponseItem.account ) {
        this.bank = this.plaidResponseItem.account;
      }
      this.views = {
        'voidCheck'  : { view: { class: 'net.nanopay.bank.ui.addUSBankModal.USBankVoidForm' }, startPoint: true },
        'pad'        : { view: { class: 'net.nanopay.bank.ui.addUSBankModal.USBankPADForm', plaidResponseItem: this.plaidResponseItem, onComplete: self.onComplete } }
      };
    },

    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    },

    function notify(message, type) {
      this.add(this.NotificationMessage.create({
        message,
        type
      }));
    }
  ]
});
