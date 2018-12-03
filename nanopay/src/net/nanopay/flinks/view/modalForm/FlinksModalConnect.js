foam.CLASS({
  package: 'net.nanopay.flinks.view.modalForm',
  name: 'FlinksModalConnect',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  requires: [
    'net.nanopay.ui.LoadingSpinner',
    'foam.u2.dialog.Popup'
  ],

  exports: [
    'as connect'
  ],

  imports: [
    'isConnecting',
    'notify',
    'institution',
    'flinksAuth',
    'user'
  ],

  css: `
    ^ {
      width: 504px;
    }
    ^content {
      position: relative;
      padding: 24px;
    }
    ^ .foam-u2-tag-Input {
      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
    ^ .property-username {
      width: 100%;
      height: 40px;
    }
    ^terms-container {
      margin-top: 24px;
      font-size: 12;
    }
    ^terms-text-container {
      display: inline-block;
      vertical-align: middle;
      margin-left: 8px;
      max-width: calc(100% - 40px);
    }
    ^checkbox {
      display: inline-block;
    }
    ^ .net-nanopay-ui-DataSecurityBanner {
      margin-top: 24px;
    }
    ^ .net-nanopay-ui-ActionView-goToTerm {
      height: auto;
      width: auto;
      background-color: transparent;
      color: %SECONDARYCOLOR%;
      font-size: 12px;
      padding: 0 3px;
    }
    ^ .net-nanopay-ui-ActionView-goToTerm:hover {
      background-color: transparent;
      color: %SECONDARYCOLOR%;
    }
    ^ .net-nanopay-ui-modal-TandCModal .iframe-container {
      height: 540px;
    }
    ^ .net-nanopay-ui-modal-TandCModal .net-nanopay-ui-modal-ModalHeader {
      display: none;
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
      name: 'username',
      view: {
        class: 'foam.u2.tag.Input',
        onKey: true
      },
      postSet: function(_, n) {
        this.viewData.username = n;
      }
    },
    {
      class: 'Password',
      name: 'password',
      view: {
        class: 'foam.u2.view.PasswordView',
        onKey: true
      }
    },
    {
      class: 'Boolean',
      name: 'isTermsAgreed',
      value: false
    },
    {
      class: 'String',
      name: 'termsURL',
      value: ''
    }
  ],

  messages: [
    { name: 'Username', message: 'Access Card # / Username' },
    { name: 'Password', message: 'Password' },
    { name: 'Connecting', message: 'Connecting... This may take a few minutes.'},
    { name: 'InvalidForm', message: 'Please complete the form before proceeding.'}
  ],

  methods: [
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
          .start('p').addClass('field-label').add(this.Username).end()
          .tag(this.USERNAME)
          .start('p').addClass('field-label').add(this.Password).end()
          .tag(this.PASSWORD)
          .start({ class: 'net.nanopay.ui.DataSecurityBanner' }).end()
          .start('div').addClass(this.myClass('terms-container'))
            .start(this.IS_TERMS_AGREED).addClass(this.myClass('checkbox')).end()
            .start('div').addClass(this.myClass('terms-text-container'))
              .add('I agree to the')
              .start(this.GO_TO_TERM).end()
              .add('and authorize the release of my Bank information to nanopay.')
            .end()
          .end()
        .end()
        .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT}).end();
    },

    async function connectToBank() {
      this.isConnecting = true;
      try {
        var response = await this.flinksAuth.authorize(
          null,
          this.institution.name,
          this.username, this.password,
          this.user
        );
      } catch (error) {
        this.notify(`${error.message}. Please try again.`, 'error');
        return;
      } finally {
        this.isConnecting = false;
      }
      switch ( response.HttpStatusCode ) {
        case 200:
          this.viewData.accounts = response.Accounts;
          this.pushToId('accountSelection');
          break;
        case 203:
          this.viewData.requestId = response.RequestId;
          this.viewData.securityChallenges = response.SecurityChallenges;
          // this.notify('should go to security challenge screen');
          this.pushToId('security');
          break;
        case 401:
          this.notify(response.Message, 'error');
          break;
        default:
          break;
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
      label: 'Connect',
      code: function(X) {
        var model = X.connect;
        if ( model.isConnecting ) return;
        if ( model.isTermsAgreed &&
            model.username.trim().length > 0 &&
            model.password.trim().length > 0 ) {
          X.connect.connectToBank();
          return;
        }
        X.notify(model.InvalidForm, 'error');
      }
    },
    {
      name: 'goToTerm',
      label: 'terms and conditions',
      code: function(X) {
        // var alternaUrl = self.window.location.orgin + "/termsandconditions/"
        // this.version = ' ';
        this.add(this.Popup.create().tag({ class: 'net.nanopay.ui.modal.TandCModal' }));
      }
    }
  ]
});
