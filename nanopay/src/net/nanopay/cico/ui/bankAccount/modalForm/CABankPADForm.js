foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.modalForm',
  name: 'CABankPADForm',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

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
    'isConnecting',
    'notify',
    'padCaptureDAO',
    'user',
    'validateAddress',
    'validateCity',
    'validatePostalCode',
    'validateStreetNumber'
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
      height: 50vh;
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
    { name: 'Title', message: 'Connect using a void check' },
    { name: 'Instructions', message: 'Connect to your account without signing in to online banking.\nPlease ensure your details are entered properly.' },
    { name: 'Connecting', message: 'Connecting... This may take a few minutes.'},
    { name: 'InvalidForm', message: 'Please complete the form before proceeding.'}
  ],

  methods: [
    function init() {
      this.SUPER();
      this.viewData.bankAccounts = [this.bank];
    },

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
          .start({ class: 'net.nanopay.bank.ui.BankPADForm' , viewData$: this.viewData$ }).enableClass(this.myClass('shrink'), this.isConnecting$).end()
        .end()
        .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT}).end();
    },

    function validateForm() {
      var transitRegEx = /^[0-9]{5}$/;
      var institutionRegEx = /^[0-9]{3}$/;
      var accountRegEx = /^\d+$/;
      var nameRegEx = /^[a-z0-9 ]{1,32}$/i;

      if ( ! this.bank.branchId ||
           ! this.bank.institutionNumber ||
           ! this.bank.accountNumber ||
           ! this.bank.name ) {
        this.notify(this.InvalidForm, 'error');
        return false;
      }

      if ( ! transitRegEx.test(this.bank.branchId) ) {
        this.notify(this.InvalidTransit, 'error');
        return false;
      }
      if ( ! institutionRegEx.test(this.bank.institutionNumber) ) {
        this.notify(this.InvalidInstitution, 'error');
        return false;
      }
      if ( ! accountRegEx.test(this.bank.accountNumber) ) {
        this.notify(this.InvalidAccount, 'error');
        return false;
      }
      if ( ! nameRegEx.test(this.bank.name) ) {
        this.notify(this.InvalidName, 'error');
        return false;
      }

      return true;
    },

    function validateInputs() {
      var user = this.viewData.user;
      if ( user.firstName.trim() === '' ) {
        this.notify('First name cannot be empty.', 'error');
        return false;
      }
      if ( user.lastName.trim() === '' ) {
        this.notify('Last name cannot be empty.', 'error');
        return false;
      }
      if ( user.firstName.length > 70 ) {
        this.notify('First name cannot exceed 70 characters.', 'error');
        return false;
      }
      if ( user.lastName.length > 70 ) {
        this.notify('Last name cannot exceed 70 characters.', 'error');
        return false;
      }
      if ( ! this.validateStreetNumber(user.address.streetNumber) ) {
        this.notify('Invalid street number.', 'error');
        return false;
      }
      if ( ! this.validateAddress(user.address.streetName) ) {
        this.notify('Invalid street number.', 'error');
        return false;
      }
      if ( ! this.validateCity(user.address.city) ) {
        this.notify('Invalid city name.', 'error');
        return false;
      }
      if ( ! this.validatePostalCode(user.address.postalCode) ) {
        this.notify('Invalid postal code.', 'error');
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
          accountNumber: this.bank.accountNumber
        }));
        this.bank.address = user.address;
        this.bank = await this.bankAccountDAO.put(this.bank);
      } catch (error) {
        this.notify(error.message, 'error');
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
      }
    }
  ]
});
