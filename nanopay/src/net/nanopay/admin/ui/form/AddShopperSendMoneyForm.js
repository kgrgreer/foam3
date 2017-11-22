foam.CLASS({
  package: 'net.nanopay.admin.ui.form',
  name: 'AddShopperSendMoneyForm',
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

      */}
    })
  ],

  messages: [
    { name: 'Step', message: 'Input the amount of money you want to send to the user.' },
    { name: 'Amount', message: 'Amount' }
  ],

  properties: [
    {
      class: 'Currency',
      name: 'amount'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
        .end();
    }
  ]
})