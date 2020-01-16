foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'UpgradeContactModal',
  extends: 'foam.u2.View',

  documentation: 'Upgrade Contact Modal',

  imports: [
    'user'
  ],

  requires: [
    'net.nanopay.payment.PaymentCode'
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
        let contact = this.data;
        let paymentCode = this.PaymentCode.create();
        paymentCode.id = this.data.paymentCodeValue;
        contact.paymentCode = paymentCode;
        try {
          await this.user.contacts.put(contact);
          console.log('done with put');
        } catch (err) {
          var msg = err.message || this.GENERIC_PUT_FAILED;
          this.ctrl.notify(msg, 'error');
        }
      }
    }
  ]
});
