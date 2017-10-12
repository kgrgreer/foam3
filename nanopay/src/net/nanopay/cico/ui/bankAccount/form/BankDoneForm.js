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
    { name: 'Done', message: 'You have successfully added this bank account! You can now use this account to cashout your device balances in the transaction screen.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())

        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('p').addClass('pDefault').add(this.Step).end()
        .end()
        .start('p').addClass('pDefault').add(this.Done).end()

    }
  ]
});
