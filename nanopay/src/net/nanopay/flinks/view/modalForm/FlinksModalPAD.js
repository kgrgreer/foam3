foam.CLASS({
  package: 'net.nanopay.flinks.view.modalForm',
  name: 'FlinksModalPAD',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  requires: [
    'net.nanopay.ui.LoadingSpinner',
    'foam.u2.dialog.Popup',
    'net.nanopay.model.PadCapture'
  ],

  exports: [
    'as pad'
  ],

  imports: [
    'accountDAO as bankAccountDAO',
    'padCaptureDAO',
    'isConnecting',
    'notify',
    'institution',
    'flinksAuth',
    'validateAddress',
    'validateCity',
    'validatePostalCode',
    'validateStreetNumber',
    'user',
    'closeDialog'
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
    ^shrink {
      height: 50vh;
      overflow: hidden;
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
    { name: 'Connecting', message: 'Connecting... This may take a few minutes.'},
    { name: 'InvalidForm', message: 'Please complete the form before proceeding.'}
  ],

  methods: [
    function init() {
      this.SUPER();
      this.viewData.user = this.user;
    },

    function initE() {
      this.addClass(this.myClass())
        .start({ class: 'net.nanopay.flinks.view.element.FlinksModalHeader', institution: this.institution }).end()
        .start('div').addClass(this.myClass('content'))
          .start('div').addClass('spinner-container').show(this.isConnecting$)
            .start('div').addClass('spinner-container-center')
              .add(this.loadingSpinner)
              .start('p').add(this.Connecting).addClass('spinner-text').end()
            .end()
          .end()
          .start({ class: 'net.nanopay.bank.ui.BankPADForm' , viewData$: this.viewData$ }).enableClass(this.myClass('shrink'), this.isConnecting$).end()
        .end()
        .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT}).end();
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
      var user = this.viewData.user;
      this.isConnecting = true;
      for ( var account of this.viewData.bankAccounts ) {
        try {
          await this.padCaptureDAO.put(this.PadCapture.create({
            firstName: user.firstName,
            lastName: user.lastName,
            userId: user.id,
            address: user.address,
            agree1: this.viewData.agree1,
            agree2: this.viewData.agree2,
            agree3: this.viewData.agree3,
            institutionNumber: account.institutionNumber,
            branchId: account.branchId, // branchId = transit number
            accountNumber: account.accountNumber
          }));
          account.address = user.address;
          await this.bankAccountDAO.put(account);
        } catch (error) {
          this.notify(error.message, 'error');
          return;
        } finally {
          this.isConnecting = false;
        }
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
        X.closeDialog();
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
