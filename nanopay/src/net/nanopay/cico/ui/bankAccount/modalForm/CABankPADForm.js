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
    'padCaptureDAO',
    'user',
    'validateAccountNumber',
    'validateAddress',
    'validateCity',
    'validateInstitutionNumber',
    'validatePostalCode',
    'validateStreetNumber',
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
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Connect using a void check' },
    { name: 'INSTRUCTIONS', message: 'Connect to your account without signing in to online banking.\nPlease ensure your details are entered properly.' },
    { name: 'CONNECTING', message: 'Connecting... This may take a few minutes.' },
    { name: 'INVALID_FORM', message: 'Please complete the form before proceeding.' },
    { name: 'ERROR_FIRST', message: 'First name cannot be empty.' },
    { name: 'ERROR_LAST', message: 'Last name cannot be empty.' },
    { name: 'ERROR_FLENGTH', message: 'First name cannot exceed 70 characters.' },
    { name: 'ERROR_LLENGTH', message: 'Last name cannot exceed 70 characters.' },
    { name: 'ERROR_STREET_NAME', message: 'Invalid street number.' },
    { name: 'ERROR_STREET_NUMBER', message: 'Invalid street name.' },
    { name: 'ERROR_CITY', message: 'Invalid city name.' },
    { name: 'ERROR_POSTAL', message: 'Invalid postal code.' },
    { name: 'ERROR_BUSINESS_NAME_REQUIRED', message: 'Business name required.' },
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

    function validateForm() {
      var nameRegEx = /^[a-z0-9 ]{1,32}$/i;
      if ( ! this.bank.branchId ||
           ! this.bank.institutionNumber ||
           ! this.bank.accountNumber ||
           ! this.bank.name ) {
        ctrl.notify(this.INVALID_FORM, 'error');
        return false;
      }

      if ( ! this.validateTransitNumber(this.bank.branchId) ) {
        ctrl.notify(this.InvalidTransit, 'error');
        return false;
      }
      if ( ! this.validateInstitutionNumber(this.bank.institutionNumber) ) {
        ctrl.notify(this.InvalidInstitution, 'error');
        return false;
      }
      if ( ! this.validateAccountNumber(this.bank.accountNumber) ) {
        ctrl.notify(this.InvalidAccount, 'error');
        return false;
      }
      if ( ! nameRegEx.test(this.bank.name) ) {
        ctrl.notify(this.InvalidName, 'error');
        return false;
      }

      return true;
    },

    function validateInputs() {
      var user = this.viewData.user;
      if ( user.firstName.trim() === '' ) {
        ctrl.notify(this.ERROR_FIRST, 'error');
        return false;
      }
      if ( user.lastName.trim() === '' ) {
        ctrl.notify(this.ERROR_LAST, 'error');
        return false;
      }
      if ( user.firstName.length > 70 ) {
        ctrl.notify(this.ERROR_FLENGTH, 'error');
        return false;
      }
      if ( user.lastName.length > 70 ) {
        ctrl.notify(this.ERROR_LLENGTH, 'error');
        return false;
      }
      if ( ! user.businessName ) {
        ctrl.notify(this.ERROR_BUSINESS_NAME_REQUIRED, 'error');
        return false;
      }
      if ( ! this.validateStreetNumber(user.address.streetNumber) ) {
        ctrl.notify(this.ERROR_STREET_NAME, 'error');
        return false;
      }
      if ( ! this.validateAddress(user.address.streetName) ) {
        ctrl.notify(this.ERROR_STREET_NUMBER, 'error');
        return false;
      }
      if ( ! this.validateCity(user.address.city) ) {
        ctrl.notify(this.ERROR_CITY, 'error');
        return false;
      }
      if ( ! this.validatePostalCode(user.address.postalCode, user.address.countryId) ) {
        ctrl.notify(this.ERROR_POSTAL, 'error');
        return false;
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
        this.bank.address = user.address;
        this.bank = await this.bankAccountDAO.put(this.bank);
      } catch (error) {
        ctrl.notify(error.message, 'error');
        return;
      } finally {
        this.isConnecting = false;
      }

      this.pushToId('microCheck');
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

        if ( ! model.validateInputs() ) return;
        model.capturePADAndPutBankAccounts();
        this.ctrl.stack.back();
        this.ctrl.notify(this.SUCCESS);
        X.closeDialog();
      }
    }
  ]
});
