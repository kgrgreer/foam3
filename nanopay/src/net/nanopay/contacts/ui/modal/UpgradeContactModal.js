foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'UpgradeContactModal',
  extends: 'foam.u2.View',

  documentation: 'Upgrade Contact Modal',

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
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.contacts.Contact',
      name: 'contact'
    },
  ],

  methods: [
    function init() {
      this.contact = this.data;
      // console.log(this.data.id);
    },

    function initE() {
      var self = this;
      this
      .addClass(this.myClass('container'))
      .start()
        .start().addClass(this.myClass('contact-title')).add("Enter Payment Code").end()
        .start(this.PAYMENT_CODE_VALUE).addClass(this.myClass('contact-input')).end()
        .start('btn').addClass(this.myClass('contact-btn')).add(this.UPGRADE).end()
      .end()
    }
  ],

  actions: [
    {
      name: 'upgrade',
      label: 'Upgrade',
      code: function(X) {
        console.log('button clicked!');
        console.log("Upgrade using " + this.paymentCodeValue);
        console.log(this.contact);
      }
    }
  ]
});
