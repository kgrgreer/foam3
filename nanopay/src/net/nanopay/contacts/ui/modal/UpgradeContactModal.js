foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'UpgradeContactModal',
  extends: 'foam.u2.View',

  documentation: 'Upgrade Contact Modal',

  imports: [
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
    ^bottom-container {
      display: flex;
      justify-content: space-between;
    }
    ^checkbox-container {
      display: flex;
      padding-top: 18px;
    }
    ^contact-checkbox {
      margin-top: 4px;
      margin-left: 10px;
    }
    ^checkbox-explaination {
      margin: 0 0 0 5px;
    }
    ^contact-btn {
      margin: 10px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'paymentCodeValue',
      documentation: 'Payment code provided by user.',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Enter payment code',
      }
    },
    {
      class: 'Boolean',
      name: 'keepExistingContact',
      documentation: 'True when user intends on keeping existing contact.',
      value: false,
      view: {
        class: 'foam.u2.CheckBox'
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
        .start()
          .addClass(this.myClass('bottom-container'))
          .start()
            .addClass(this.myClass('checkbox-container'))
            .start()
              .addClass(this.myClass('contact-checkbox'))
              .start(this.KEEP_EXISTING_CONTACT)
              .end()
            .end()
            .start('p')
              .addClass(this.myClass('checkbox-explaination'))
              .add('Keep existing contact')
            .end()
          .end()
          .startContext({ data: this })
            .start('btn')
              .addClass(this.myClass('contact-btn'))
              .add(this.UPGRADE)
            .end()
          .endContext()
        .end()
      .end()
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
      name: 'upgrade',
      label: 'Upgrade',
      code: async function(X) {
        let { paymentCodeValue, keepExistingContact } = this.data;
        let contact = keepExistingContact
          ? this.Contact.create({
              type: 'Contact',
              group: 'sme',
              email: 'temp' + this.generateTemporaryId() + this.data.email,
              organization: 'temp' + this.generateTemporaryId() + this.data.businessName
            })
          : this.data;
        contact.paymentCode = paymentCodeValue;
        contact.createdUsingPaymentCode = true;
        try {
          await this.user.contacts.put(contact);
          this.ctrl.notify('Success upgrading contact!', 'success');
          X.closeDialog();
        } catch (err) {
          var msg = err.message || this.GENERIC_PUT_FAILED;
          this.ctrl.notify(msg, 'error');
        }
      }
    }
  ]
});
