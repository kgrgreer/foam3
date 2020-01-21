foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactByPaymentCodeModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Add Contact By PaymentCode Modal',

  imports: [
    'addPaymentCodeContact',
    'closeDialog',
    'ctrl',
    'user',
  ],

  requires: [
    'net.nanopay.contacts.Contact'
  ],

  css: `
    ^container {
      width: 540px;
      box-sizing: border-box;
      padding: 24px;
    }
    ^contact-title {
      font-size: 12px;
      font-weight: 600;
      line-height: 1;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    ^contact-input {
      width: 100%;
      margin: 0;
    }
    ^contact-btn {
      margin: 10px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'paymentCodeValue',
      documentation: 'This property is payment code data provided by user.',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Enter payment code',
      }
    }
  ],

  methods: [

    function initE() {
      this
      .addClass(this.myClass('container'))
        .start()
          .addClass(this.myClass('contact-title'))
          .add('Enter Payment Code')
        .end()
        .start(this.PAYMENT_CODE_VALUE)
          .addClass(this.myClass('contact-input'))
        .end()
        .startContext({ data: this })
          .tag({
            class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar',
            back: this.BACK,
            next: this.ADD_CONTACT_BY_PAYMENT_CODE
          })
        .endContext()
      .end();
    },

    function dec2hex(dec) {
      return ('0' + dec.toString(16)).substr(-2);
    },

    function generateTemporaryId() {
      var array = new Uint8Array((15 || 40) / 2);
      window.crypto.getRandomValues(array);
      return Array.from(array, this.dec2hex).join('');
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Go back',
      code: function(X) {
        if ( X.subStack.depth > 1 ) {
          X.subStack.back();
        } else {
          X.closeDialog();
        }
      }
    },
    {
      name: 'AddContactByPaymentCode',
      label: 'Add Contact',
      code: async function(X) {
        console.log('add contact using paymentcode');
        console.log(this);

        let contact = this.Contact.create({
            type: 'Contact',
            group: 'sme',
            email: 'temp' + this.generateTemporaryId() + this.user.email,
            organization: 'temp' + this.generateTemporaryId() + this.user.organization
        });
        contact.paymentCode = this.paymentCodeValue;
        contact.createdUsingPaymentCode = true;

        try {
          let response = await this.user.contacts.put(contact);
          console.log(response);
          console.log('done with put');
          this.ctrl.notify('Success Upgrading Contact!', 'success');
          X.closeDialog();
        } catch (err) {
          var msg = err.message || this.GENERIC_PUT_FAILED;
          console.log(msg);
          this.ctrl.notify(msg, 'error');
        }
      }
    }
  ]
});
