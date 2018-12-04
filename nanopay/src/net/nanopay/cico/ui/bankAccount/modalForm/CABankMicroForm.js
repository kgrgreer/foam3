foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.modalForm',
  name: 'CABankMicroForm',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  requires: [
    'net.nanopay.ui.LoadingSpinner'
  ],

  exports: [
    'as micro'
  ],

  imports: [
    'isConnecting',
    'notify',
    'bank'
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
    }

  `,

  properties: [
    {
      name: 'loadingSpinner',
      factory: function() {
        var spinner = this.LoadingSpinner.create();
        return spinner;
      }
    }
  ],

  messages: [
    { name: 'Title', message: 'Connect using a void check' },
    { name: 'Instructions', message: 'Connect to your account without signing in to online banking.\nPlease ensure your details are entered properly.' },
    { name: 'Connecting', message: 'Connecting... This may take a few minutes.'},
    { name: 'InvalidForm', message: 'Please complete the form before proceeding.'}
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
          .start('p').addClass(this.myClass('instructions')).add(this.Instructions).end()
          // TODO
        .end()
        .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT}).end();
    },

    function validateForm() {
      // TODO

      return true;
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Come Back Later',
      code: function(X) {
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

        // TODO : Close Modal or go to done form
      }
    }
  ]
});
