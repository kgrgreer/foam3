foam.CLASS({
  package: 'net.nanopay.admin.ui.form',
  name: 'AddShopperReviewForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to review shopper information to make sure its correct',

  imports: [
    'veiwData',
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
    { name: 'Step', message: 'Step 3: Please review all the details of the user.' },
    { name: 'ShopperInfo', message: 'Shopper Info' },
    { name: 'Email', message: 'Email' },
    { name: 'PhoneNumber', message: 'Phone No.' },
    { name: 'Birthday', message: 'Birthday' },
    { name: 'Address', message: 'Address' },
    { name: 'Password', message: 'Password' },
    { name: 'SendMoney', message: 'Send Money' },
    { name: 'Amount', message: 'Amount' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .start('p').addClass('pDefault').add(this.Step).end()
        .end();
    }
  ]
})