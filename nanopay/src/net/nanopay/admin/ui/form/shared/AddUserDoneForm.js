foam.CLASS({
  package: 'net.nanopay.admin.ui.form.shared',
  name: 'AddUserDoneForm',
  extends: 'foam.u2.Controller',

  documentation: 'Screen to let user know they have finished adding a user',

  imports: [
    'viewData',
    'goBack',
    'goNext'
  ],

  css: `
    ^ .description {
      font-size: 12px;
      letter-spacing: 0.3px;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 20px;
    }
    ^ .referenceNumber {
      font-size: 12px;
      letter-spacing: 0.3px;
      color: #2cab70;
      margin-top: 10px;
    }
  `,

messages: [
  { name: 'Step', message: 'Step 4: Done!' },
  { name: 'Description', message: 'An e-mail with the login information has been sent to this user.' },
  { name: 'ReferenceNumber', message: 'Reference No.' }
],

methods: [
  function initE() {
    this.SUPER();

    this
      .addClass(this.myClass())
      .start()
        .start('p').add(this.Step).addClass('pDefault').addClass('stepTopMargin').end()
        .start('p').add(this.Description).addClass('description').end()
      .end();
  }
]

}); 