foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.form',
  name: 'BankDoneForm',
  extends: 'foam.u2.Controller',

  documentation: 'End of the add bank flow. Show success message here.',

  imports: [
    'viewData',
    'errors',
    'goBack',
    'goNext'
  ],

  messages: [
    { name: 'Step', message: 'Step 4: Done!' },
    { name: 'Done', message: 'You have successfully added and verified this bank account! You are now ready to use the cash in / cash out service to manage your balances!' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())

        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('p').addClass('pDefault').addClass('stepTopMargin').add(this.Step).end()
        .end()
        .start('p').addClass('pDefault').add(this.Done).end()

    }
  ]
});