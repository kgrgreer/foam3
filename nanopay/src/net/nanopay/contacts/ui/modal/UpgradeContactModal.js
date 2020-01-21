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
      documentation: 'This property is payment code data provided by user.',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Enter payment code',
      }
    },
    {
      class: 'Boolean',
      name: 'keepExistingContact',
      documentation: 'True when user intends on keep existing contact.',
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
  ],

  actions: [
    {
      name: 'upgrade',
      label: 'Upgrade',
      code: async function(X) {
        console.log('button clicked!');
        let { paymentCodeValue, keepExistingContact } = this.data;
        let contact = keepExistingContact ?
          this.Contact.create({
            type: 'Contact',
            group: 'sme',
            email: 'temp' + this.data.email,
            organization: this.data.businessName
          })
          :
          this.data;
        contact.paymentCode = paymentCodeValue;
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
