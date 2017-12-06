foam.CLASS({
  package: 'net.nanopay.admin.ui.form.merchant',
  name: 'AddMerchantSendMoneyForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to input amount to be sent to the new user',

  imports: [
    'viewData',
    'goBack',
    'goNext'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .stepTwoBottomMargin {
          margin-bottom: 30px;
        }
        ^ .property-amount {
          margin-left: 0;
          border-radius: 0;
        }
      */}
    })
  ],

  messages: [
    { name: 'Step', message: 'Step 4: Input the amount of money you want to send to the user.' },
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