foam.CLASS({
  package: 'net.nanopay.contact.ui.modal',
  name: 'ContactInformation',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  requires: [
    'net.nanopay.ui.LoadingSpinner',
  ],

  exports: [
    'as information'
  ],

  css: `
    ^ {
      max-height: 80vh;
      overflow-y: scroll;
    }
    ^title {
      padding: 25px;
    }
    ^title p {
      font-size: 24px;
      font-weight: 900;
      color: #2b2b2b;
      margin: 0;
    }
    ^disclaimer {
      width: 100%;
      height: 56px;

      box-sizing: border-box;
      padding: 18px;
      padding-left: 56px;

      background-color: #ffe2b3;
      border: 1px solid #e49921;
      border-radius: 3px;

      background-repeat: no-repeat;
      background-position-x: 18px;
      background-position-y: 18px;
      background-image: url(images/ic-disclaimer.svg);
    }
    ^disclaimer p {
      margin: 0;
    }
    ^content {
      padding: 0 25px;
      padding-bottom: 25px;
    }
    ^half-field-container {
      width: 220px;
      margin-top: 16px;
      margin-left: 16px;
      display: inline-block;
    }
    ^half-field-container:first-child {
      margin-left: 0;
    }
    ^field-label {
      font-size: 12px;
      font-weight: 600;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    ^field-label:first-child {
      margin-top: 0;
    }
    ^ .foam-u2-tag-Input {
      width: 100%;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
    ^check-box-container {
      margin-top: 16px;
    }
    ^divider {
      width: 100%;
      height: 1px;

      margin: 24px 0;
      background-color: #e2e2e3;
    }
    ^header {
      margin: 0;

      font-size: 16px;
      font-weight: 900;
    }
    ^instructions {
      margin: 0;
      margin-top: 8px;
      line-height: 1.5;
      font-size: 16px;
      color: #8e9090;
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
    ^spinner-container {
      background-color: #ffffff;
      width: 100%;
      height: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
      z-index: 1;
    }
    ^spinner-container-center {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      height: 100%;
    }
    ^spinner-container .net-nanopay-ui-LoadingSpinner img {
      width: 50px;
      height: 50px;
    }
    ^spinner-text {
      font-weight: normal;
      font-size: 12px;
      color: rgba(9, 54, 73, 0.7);
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
      class: 'Boolean',
      name: 'isConnecting',
      value: false
    },
    {
      class: 'String',
      name: 'companyName',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: 'Enter company name',
        onKey: true
      }
    },
    {
      class: 'String',
      name: 'firstName',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: 'Jane',
        onKey: true
      }
    },
    {
      class: 'String',
      name: 'lastName',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: 'Doe',
        onKey: true
      }
    },
    {
      class: 'String',
      name: 'email',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: 'example@email.com',
        onKey: true
      }
    },
    {
      class: 'Boolean',
      name: 'invite',
      value: false,
      view: {
        class: 'foam.u2.CheckBox',
        label: 'Send an email invitation to this client'
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
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
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
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
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
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Add a Contact' },
    { name: 'CONNECTING', message: 'Connecting... This may take a few minutes.' },
    { name: 'DISCLAIMER', message: 'Added contacts must be businesses, not personal accounts.' },
    { name: 'PLACE_COMPANY', message: 'Enter company name' },
    { name: 'FIELD_COMPANY', message: 'Company name' },
    { name: 'FIELD_FIRST_NAME', message: 'First name' },
    { name: 'FIELD_LAST_NAME', message: 'Last name' },
    { name: 'FIELD_EMAIL', message: 'Email' },
    { name: 'HEADER_BANKING', message: 'Banking information' },
    { name: 'INSTRUCTIONS_BANKING', message: 'When adding banking information for a contact, please be sure to double check it, as all future payments will be sent directly to this account.' },
    { name: 'TRANSIT', message: 'Transit #' },
    { name: 'INSTITUTION', message: 'Institution #' },
    { name: 'ACCOUNT', message: 'Account #' },
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .start().addClass(this.myClass('title'))
          .start('p').add(this.TITLE).end()
        .end()
        .start().addClass(this.myClass('content'))
          .start().addClass(this.myClass('spinner-container')).show(this.isConnecting$)
            .start().addClass(this.myClass('spinner-container-center'))
              .add(this.loadingSpinner)
              .start('p').add(this.CONNECTING).addClass(this.myClass('spinner-text')).end()
            .end()
          .end()
          .start().addClass(this.myClass('disclaimer'))
            .start('p').add(this.DISCLAIMER).end()
          .end()
          .start('p').addClass(this.myClass('field-label')).add(this.FIELD_COMPANY).end()
          .add(this.COMPANY_NAME)
          .start()
            .start().addClass(this.myClass('half-field-container'))
              .start('p').addClass(this.myClass('field-label')).add(this.FIELD_FIRST_NAME).end()
              .add(this.FIRST_NAME)
            .end()
            .start().addClass(this.myClass('half-field-container'))
              .start('p').addClass(this.myClass('field-label')).add(this.FIELD_LAST_NAME).end()
              .add(this.LAST_NAME)
            .end()
          .end()
          .start('p').addClass(this.myClass('field-label')).add(this.FIELD_EMAIL).end()
          .add(this.EMAIL)
          .start().addClass(this.myClass('check-box-container'))
            .add(this.INVITE)
          .end()

          .callIf(this.viewData.isBankingProvided, function() {
            this.start().addClass(self.myClass('divider')).end()
              .start('p').addClass(self.myClass('header')).add(self.HEADER_BANKING).end()
              .start('p').addClass(self.myClass('instructions')).add(self.INSTRUCTIONS_BANKING).end()
              .start({ class: 'foam.u2.tag.Image', data: 'images/Canada-Check@2x.png' }).addClass(self.myClass('check-image')).end()
              .start().addClass(self.myClass('field-container')).addClass(self.myClass('transit-container'))
                .start('p').addClass(self.myClass('field-label')).add(self.TRANSIT).end()
                .tag(self.TRANSIT_NUMBER)
              .end()
              .start().addClass(self.myClass('field-container')).addClass(self.myClass('institution-container'))
                .start('p').addClass(self.myClass('field-label')).add(self.INSTITUTION).end()
                .tag(self.INSTITUTION_NUMBER)
              .end()
              .start().addClass(self.myClass('field-container')).addClass(self.myClass('account-container'))
                .start('p').addClass(self.myClass('field-label')).add(self.ACCOUNT).end()
                .tag(self.ACCOUNT_NUMBER)
              .end()
          })
        .end()
        .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT}).end();;
    },

    async function createContact() {
      this.isConnecting = true;
      if ( this.viewData.isBankingProvided ) {
        // TODO
      }

      this.isConnecting = false;
    },

    async function createBank() {
      // TODO
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
      label: 'Connect',
      code: function(X) {
        var model = X.information;
        if ( model.isConnecting ) return;

        // TODO
      }
    }
  ]
});
