foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.modalForm',
  name: 'CABankVoidForm',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Screen with void check that outlines where to locate banking information',

  requires: [
    'net.nanopay.ui.LoadingSpinner'
  ],

  exports: [
    'as check'
  ],

  imports: [
    'bank',
    'isConnecting',
    'notify',
  ],

  css: `
    ^ {
      width: 504px;
      max-height: 80vh;
      overflow-y: scroll;
    }
    ^shrink {
      /*max height - titlebar - navigationbar - content padding*/
      max-height: calc(80vh - 77px - 88px - 24px);
      overflow: hidden;
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
      flex-grow: 2;
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
    ^flex {
      display: flex;
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
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Connect using a void check' },
    { name: 'INSTRUCTIONS', message: 'Connect to your account without signing in to online banking. Please ensure your details are entered properly.' },
    { name: 'TRANSIT', message: 'Transit #' },
    { name: 'INSTITUTION', message: 'Institution #' },
    { name: 'ACCOUNT', message: 'Account #' },
    { name: 'LABEL_NICKNAME', message: 'Nickname' },
    { name: 'HINT', message: 'Set a nickname to easily identify your account later on.' },
    { name: 'CONNECTING', message: 'Connecting... This may take a few minutes.' },
    { name: 'BANK_NAME_PLACEHOLDER', message: 'My Bank' },
    { name: 'BANK_NAME_ERROR', message: 'Please set a nickname to easily identify your account later on.' }
  ],

  methods: [
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
          .start({ class: 'foam.u2.tag.Image', data: 'images/Canada-Check@2x.png' }).addClass(this.myClass('check-image')).end()
          .start()
            .addClass(this.myClass('flex'))
            .start().addClass(this.myClass('field-container')).addClass(this.myClass('transit-container'))
              .start('p').addClass('field-label').add(this.TRANSIT).end()
              .tag(this.TRANSIT_NUMBER)
            .end()
            .start().addClass(this.myClass('field-container')).addClass(this.myClass('institution-container'))
              .start('p').addClass('field-label').add(this.INSTITUTION).end()
              .tag(this.INSTITUTION_NUMBER)
            .end()
            .start().addClass(this.myClass('field-container')).addClass(this.myClass('account-container'))
              .start('p').addClass('field-label').add(this.ACCOUNT).end()
              .tag(this.ACCOUNT_NUMBER)
            .end()
          .end()
          .start().addClass(this.myClass('field-container')).addClass(this.myClass('name-container'))
            .start('p').addClass('field-label').add(this.LABEL_NICKNAME).end()
            .startContext({ data: this.bank })
              .tag(this.bank.NAME, { placeholder: this.BANK_NAME_PLACEHOLDER })
            .endContext()
            .start('p').addClass(this.myClass('hint')).add(this.HINT).end()
          .end()
          .start({ class: 'net.nanopay.ui.DataSecurityBanner' }).end()
        .end()
        .start({
          class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar',
          back: this.BACK, next: this.NEXT
        })
        .end();
    },

    function validateForm() {
      if ( this.institutionNumber === '' ) {
        ctrl.notify('Institution number required', 'error');
        return false;
      } else if ( ! RegExp('^[0-9]{3}$').test(this.institutionNumber) ) {
        ctrl.notify('Invalid institution number.', 'error');
        return false;
      }
      if ( this.bank.errors_ ) {
        ctrl.notify(this.bank.errors_[0][1], 'error');
        return false;
      }
      if ( this.bank.name.trim() === '' ) {
        ctrl.notify(this.BANK_NAME_ERROR, 'error');
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
