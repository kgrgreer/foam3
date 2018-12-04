foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.modalForm',
  name: 'CABankMicroForm',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  requires: [
    'net.nanopay.ui.LoadingSpinner',
    'foam.u2.dialog.NotificationMessage'
  ],

  exports: [
    'as micro'
  ],

  imports: [
    'isConnecting',
    'notify',
    'bank',
    'bankAccountVerification',
    'ctrl'
  ],

  css: `
    ^ {
      width: 504px;
    }
    ^content {
      position: relative;
      padding: 24px;
      padding-top: 0;
    }
    ^title {
      margin: 0;
      padding: 24px;
      font-size: 24px;
      font-weight: 900;
    }
    ^instructions {
      font-size: 16px;
      line-height: 1.5;
      color: #8e9090;

      margin: 0;
      margin-bottom: 24px;
    }
    ^field-container {
      margin-top: 32px;
      margin-bottom: 16px;
    }
    ^ .foam-u2-FloatView {
      width: 100%;
    }
  `,

  properties: [
    {
      name: 'loadingSpinner',
      factory: function() {
        var spinner = this.LoadingSpinner.create();
        return spinner;
      }
    },
    {
      class: 'Double',
      name: 'amount',
      value: 0.01
    }
  ],

  messages: [
    { name: 'Title', message: 'Verify your bank account' },
    { name: 'Instructions1', message: 'To verify that you own this account, we have made a micro-deposit (a small transaction between $0.01-$0.99).  This will appear in your account records in 2-3 business days. ' },
    { name: 'Instructions2', message: 'When the micro-deposit appears, enter the amount of the transaction below to verify your bank account.' },
    { name: 'Micro', message: 'Micro deposit amount' },
    { name: 'MicroPlaceholder', message: 'Enter micro-deposit amount' },
    { name: 'Connecting', message: 'Connecting... This may take a few minutes.' },
    { name: 'InvalidForm', message: 'You have entered an invalid amount. Please try again.' },
    { name: 'DefaultError', message: 'An error occurred while processing your request.' },
    { name: 'Success', message: 'You have successfully verified your bank account!' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start('p').addClass(this.myClass('title')).add(this.Title).end()
        .start('div').addClass(this.myClass('content'))
          .start('div').addClass('spinner-container').show(this.isConnecting$)
            .start('div').addClass('spinner-container-center')
              .add(this.loadingSpinner)
              .start('p').add(this.Connecting).addClass('spinner-text').end()
            .end()
          .end()
          .start('p').addClass(this.myClass('instructions')).add(this.Instructions1).end()
          .start('p').addClass(this.myClass('instructions')).add(this.Instructions2).end()
          .start('div').addClass(this.myClass('field-container'))
            .start('p').addClass('field-label').add(this.Micro).end()
            .tag({ class: 'foam.u2.FloatView', data$: this.amount$, min: 0.01, max: 0.99, placeholder: this.MicroPlaceholder })
          .end()
        .end()
        .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT}).end();
    },

    function validateForm() {
      console.log(this.amount*100);
      if ( this.amount <= 0 || this.amount >= 1 ) {
        this.notify(this.InvalidForm, 'error');
        return false;
      }
      return true;
    },

    async function verifyBankAccount() {
      this.isConnecting = true;
      try {
        var isVerified = await this.bankAccountVerification
          .verify(null, this.bank.id, this.amount*100);
      } catch (error) {
        this.notify(error.message ? error.message : this.DefaultError, 'error');
        return;
      } finally {
        this.isConnecting = false;
      }

      if ( isVerified ) {
        this.ctrl.add(this.NotificationMessage.create({ message: this.Success }));
        if ( this.onComplete ) this.onComplete();
        this.closeDialog();
      }
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Cancel',
      code: function(X) {
        if ( X.onComplete ) X.onComplete();
        X.closeDialog();
      }
    },
    {
      name: 'next',
      label: 'Verify',
      code: function(X) {
        var model = X.micro;
        if ( model.isConnecting ) return;
        if ( ! model.validateForm() ) return;

        model.verifyBankAccount();
      }
    }
  ]
});
