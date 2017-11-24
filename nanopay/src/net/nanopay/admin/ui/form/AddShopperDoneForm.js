foam.CLASS({
  package: 'net.nanopay.admin.ui.form',
  name: 'AddShopperDoneForm',
  extends: 'foam.u2.Controller',

  documentation: 'Screen to let user know they have finished adding a shopper',

  imports: [
    'viewData',
    'goBack',
    'goNext'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .description {
          font-size: 12px;
          letter-spacing: 0.3px;
          color: #093649;
          margin-top: 20px;
        }
        ^ .referenceNumber {
          font-size: 12px;
          letter-spacing: 0.3px;
          color: #2cab70;
          margin-top: 10px;
        }
      */}
    })
  ],

  messages: [
    { name: 'Step', message: 'Step 4: Done!' },
    { name: 'Description', message: 'An e-mail with the login information has been sent to this shopper.' },
    { name: 'ReferenceNumber', message: 'Reference No.  1234XXSDFGFGRT' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .start('p').add(this.Step).addClass('pDefault stepTopMargin').end()
          .start('p').add(this.Description).addClass('description').end()
          .start('p').add(this.ReferenceNumber).addClass('referenceNumber').end()
        .end();
    }
  ]

  
})