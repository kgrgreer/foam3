foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.modalForm',
  name: 'CABankVoidForm',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  requires: [
    'net.nanopay.ui.LoadingSpinner'
  ],

  exports: [
    'as check'
  ],

  imports: [
    'bank',
    'isConnecting',
    'notify'
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
    ^check-image {
      width: 100%;
      height: auto;
      margin-top: 24px;
    }
    ^field-container {
      display: inline-block;
      vertical-align: top;
    }
    ^field-container input {
      width: 100%;
      height: 40px;
    }
    ^transit-container {
      width: 133px;
      margin-right: 16px;
    }
    ^institution-container {
      width: 71px;
      margin-right: 16px;
    }
    ^account-container {
      width: 220px;
    }
    ^name-container {
      margin-top: 16px;
      width: 100%;
    }
    ^ .net-nanopay-ui-DataSecurityBanner {
      margin-top: 24px;
    }
    ^ .field-label {
      margin-top: 4px;
    }
    ^hint {
      margin: 0;
      margin-top: 8px;
      font-size: 10px;
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
      class: 'String',
      name: 'transitNumber',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '12345',
        maxLength: 5,
        onKey: true
      },
      factory: function() {
        return this.bank.branchId ? this.bank.branchId : '';
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
      },
      postSet: function(_, n) {
        this.bank.branchId = n;
      }
    },
    {
      class: 'String',
      name: 'institutionNumber',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '123',
        maxLength: 3,
        onKey: true
      },
      factory: function() {
        if ( this.bank.institution ) {
          return this.bank.institution.institutionNumber;
        }
        if ( this.bank.institutionNumber ) {
          return this.bank.institutionNumber;
        }
        return '';
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
      },
      postSet: function(_, n) {
        this.bank.institutionNumber = n;
      }
    },
    {
      class: 'String',
      name: 'accountNumber',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '1234567',
        onKey: true
      },
      factory: function() {
        return this.bank.accountNumber ? this.bank.accountNumber : '';
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
      },
      postSet: function(_, n) {
        this.bank.accountNumber = n;
      }
    },
    {
      class: 'String',
      name: 'nickname',
      view: {
        class: 'foam.u2.tag.Input',
        maxLength: 32,
        placeholder: 'My Bank',
        onKey: true
      },
      factory: function() {
        return this.bank.name ? this.bank.name : '';
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^[a-z0-9 ]{0,32}$/i; // alphanumerical only
        return reg.test(n) ? n : o;
      },
      postSet: function(_, n) {
        this.bank.name = n;
      }
    }
  ],

  messages: [
    { name: 'Title', message: 'Connect using a void check' },
    { name: 'Instructions', message: 'Connect to your account without signing in to online banking.\nPlease ensure your details are entered properly.' },
    { name: 'Transit', message: 'Transit #' },
    { name: 'Institution', message: 'Institution #' },
    { name: 'Account', message: 'Account #' },
    { name: 'Nickname', message: 'Nickname' },
    { name: 'Hint', message: 'Set a nickname to easily identify your account later on.' },
    { name: 'Connecting', message: 'Connecting... This may take a few minutes.'},
    { name: 'InvalidForm', message: 'Please complete the form before proceeding.'},
    { name: 'InvalidTransit', message: 'Invalid transit #.'},
    { name: 'InvalidInstitution', message: 'Invalid institution #.'},
    { name: 'InvalidAccount', message: 'Invalid account #.'},
    { name: 'InvalidName', message: 'Invalid nickname. Please use alphanumerical values only.'}
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
          .start({ class: 'foam.u2.tag.Image', data: 'images/Canada-Check@2x.png' }).addClass(this.myClass('check-image')).end()
          .start('div').addClass(this.myClass('field-container')).addClass(this.myClass('transit-container'))
            .start('p').addClass('field-label').add(this.Transit).end()
            .tag(this.TRANSIT_NUMBER)
          .end()
          .start('div').addClass(this.myClass('field-container')).addClass(this.myClass('institution-container'))
            .start('p').addClass('field-label').add(this.Institution).end()
            .tag(this.INSTITUTION_NUMBER)
          .end()
          .start('div').addClass(this.myClass('field-container')).addClass(this.myClass('account-container'))
            .start('p').addClass('field-label').add(this.Account).end()
            .tag(this.ACCOUNT_NUMBER)
          .end()
          .start('div').addClass(this.myClass('field-container')).addClass(this.myClass('name-container'))
            .start('p').addClass('field-label').add(this.Nickname).end()
            .tag(this.NICKNAME)
            .start('p').addClass(this.myClass('hint')).add(this.Hint).end()
          .end()
          .start({ class: 'net.nanopay.ui.DataSecurityBanner' }).end()
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
      label: 'Next',
      code: function(X) {
        var model = X.check;
        if ( model.isConnecting ) return;
        if ( ! model.validateForm() ) return;

        X.pushToId('pad');
      }
    }
  ]
});
