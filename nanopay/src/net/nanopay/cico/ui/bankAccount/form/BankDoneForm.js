foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.form',
  name: 'BankDoneForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'End of the add bank flow. Show success message here.',

  messages: [
    { name: 'Step', message: 'Step 4: Done!' },
    { name: 'SuccessMessage', message: 'You have successfully added and verified this bank account!' },
    { name: 'Back', message: 'Back' },
    { name: 'Done', message: 'Done' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.backLabel = this.Back;
      this.nextLabel = this.Done;
      this
        .addClass(this.myClass())

        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('p').addClass('pDefault').addClass('stepTopMargin').add(this.Step).end()
        .end()
        .start('p').addClass('pDefault').add(this.SuccessMessage).end();
    }
  ]
});
