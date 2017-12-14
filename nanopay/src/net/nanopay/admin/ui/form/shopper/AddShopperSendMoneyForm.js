foam.CLASS({
  package: 'net.nanopay.admin.ui.form.shopper',
  name: 'AddShopperSendMoneyForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to input amount to be sent to the new user',

  imports: [
    'viewData',
    'goBack',
    'goNext'
  ],

  css:`
    ^ .stepTwoBottomMargin {
      margin-bottom: 30px;
    }
    ^ .property-amount {
      margin-left: 0;
      border-radius: 0;
    }
  `,

  messages: [
    { name: 'Step', message: 'Step 3: Input the amount of money you want to send to the user.' },
    { name: 'AmountLabel', message: 'Amount' }
  ],

  properties: [
    {
      class: 'Currency',
      name: 'amount',
      postSet: function(oldValue, newValue) {
        this.viewData.amount = newValue;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .start('p').add(this.Step).addClass('pDefault stepTopMargin stepTwoBottomMargin').end()
          .start().add(this.AmountLabel).addClass('infoLabel').end()
          .start(this.AMOUNT).addClass('inputLarge').end()
        .end();
    }
  ]
});