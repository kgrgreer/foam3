foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'UpgradeContactModal',
  extends: 'foam.u2.View',

  documentation: 'Upgrade Contact Modal',

  imports: [
    'closeDialog',
    'ctrl',
    'user'
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
      float: right;
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
        .start().addClass(this.myClass('contact-title')).add('Enter Payment Code').end()
        .start(this.PAYMENT_CODE_VALUE).addClass(this.myClass('contact-input')).end()
        .startContext({ data: this }).start('btn').addClass(this.myClass('contact-btn')).add(this.UPGRADE).end().endContext()
      .end()
    },
  ],

  actions: [
    {
      name: 'upgrade',
      label: 'Upgrade',
      code: async function(X) {
        console.log('button clicked!');
        console.log(this.data.paymentCodeValue);
        let contact = this.data;
        contact.paymentCode = this.data.paymentCodeValue;
        try {
          let response = await this.user.contacts.put(contact);
          console.log(response);
          console.log('done with put');
          this.ctrl.notify('Success Upgrading Contact!', 'success');
          X.closeDialog();
        } catch (err) {
          var msg = err.message || this.GENERIC_PUT_FAILED;
          this.ctrl.notify(msg, 'error');
        }
      }
    }
  ]
});
