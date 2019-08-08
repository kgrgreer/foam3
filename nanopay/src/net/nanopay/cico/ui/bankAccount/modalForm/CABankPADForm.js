foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.modalForm',
  name: 'CABankPADForm',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'PAD form screen',

  requires: [
    'foam.u2.dialog.Popup',
    'net.nanopay.model.PadCapture',
    'net.nanopay.ui.LoadingSpinner'
  ],

  exports: [
    'as pad'
  ],

  imports: [
    'accountDAO as bankAccountDAO',
    'bank',
    'ctrl',
    'isConnecting',
    'notify',
    'padCaptureDAO',
    'user',
    'validateAccountNumber',
    'validateInstitutionNumber',
    'validateTransitNumber'
  ],

  css: `
    ^ {
      width: 504px;
      max-height: 80vh;
      overflow-y: scroll;
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
    ^shrink {
      /*max height - titlebar - navigationbar - content padding*/
      max-height: calc(80vh - 77px - 88px - 24px);
      overflow: hidden;
    }
    ^ .net-nanopay-bank-ui-BankPADForm {
      margin-top: 24px;
    }
    ^ input,
    ^ select {
      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
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
    'error'
  ],

  messages: [
    { name: 'TITLE', message: 'Connect using a void check' },
    { name: 'INSTRUCTIONS', message: 'Connect to your account without signing in to online banking.\nPlease ensure your details are entered properly.' },
    { name: 'CONNECTING', message: 'Connecting... This may take a few minutes.' },
    { name: 'INVALID_FORM', message: 'Please complete the form before proceeding.' },
    { name: 'SUCCESS', message: 'Your bank account has been added, please verify the deposited amount. It should appear in this account in 2-3 business days.' }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.viewData.bankAccounts = [this.bank];
    },

    function initE() {
      this.addClass(this.myClass())
        .start('p').addClass(this.myClass('title')).add(this.TITLE).end()
        .start().addClass(this.myClass('content')).enableClass(this.myClass('shrink'), this.isConnecting$)
          .start().addClass('spinner-container').show(this.isConnecting$)
            .start().addClass('spinner-container-center')
              .add(this.loadingSpinner)
              .start('p').add(this.CONNECTING).addClass('spinner-text').end()
            .end()
          .end()
          .start('p').addClass(this.myClass('instructions')).add(this.INSTRUCTIONS).end()
          .start({ class: 'net.nanopay.bank.ui.BankPADForm', viewData$: this.viewData$ })
            .enableClass(this.myClass('shrink'), this.isConnecting$)
          .end()
        .end()
        .start({
          class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar',
          back: this.BACK,
          next: this.NEXT
        }).end();
    },

    function validateInputs() {
      if ( this.viewData.user.errors_ ) {
        this.ctrl.notify(this.viewData.user.errors_[0][1], 'error');
        return;
      }

      if ( this.bank.errors_ ) {
        this.ctrl.notify(this.bank.errors_[0][1], 'error');
        return;
      }

      if ( this.bank.address.errors_ ) {
        this.ctrl.notify(this.bank.address.errors_[0][1], 'error');
        return;
      }

      return true;
    },

    async function capturePADAndPutBankAccounts() {
      this.isConnecting = true;

      var user = this.viewData.user;

      try {
        await this.padCaptureDAO.put(this.PadCapture.create({
          firstName: user.firstName,
          lastName: user.lastName,
          userId: user.id,
          address: user.address,
          agree1: this.viewData.agree1,
          agree2: this.viewData.agree2,
          agree3: this.viewData.agree3,
          institutionNumber: this.bank.institutionNumber,
          branchId: this.bank.branchId, // branchId = transit number
          accountNumber: this.bank.accountNumber,
          companyName: this.viewData.padCompanyName
        }));

        this.bank = await this.bankAccountDAO.put(this.bank);
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isConnecting = false;
      }
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Back',
      code: function(X) {
        X.subStack.back();
      }
    },
    {
      name: 'next',
      label: 'I Agree',
      code: function(X) {
        var model = X.pad;
        if ( model.isConnecting ) return;
        this.bank.address = this.viewData.user.address;
        if ( ! model.validateInputs() ) return;
        model.capturePADAndPutBankAccounts().then(() => {
          this.error ? this.ctrl.notify(this.error, 'error') : this.ctrl.notify(this.SUCCESS);
          this.ctrl.stack.back();
          X.closeDialog();
        });
      }
    }
  ]
});
