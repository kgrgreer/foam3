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

      */}
    })
  ],

  messages: [
    { name: 'Step', message: 'Step 4: Done!' },
    { name: 'Description', message: 'An e-mail with the login information has been send to this shopper.' },
    { name: 'ReferenceNumber', message: 'Reference No.' }
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