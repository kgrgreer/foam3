foam.CLASS({
  package: 'net.nanopay.admin.ui.settings.bankAccount.form',
  name: 'BankDoneForm',
  extends: 'foam.u2.Controller',

  messages: [
    { name: 'Step', message: 'You are all set!' },
    { name: 'Done', message: 'You can always go to the "auto-cashout menu" under your company name to change the setting at any time.' }
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
})
