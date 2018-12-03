foam.CLASS({
  package: 'net.nanopay.flinks.view.modalForm',
  name: 'FlinksModalConnect',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  requires: [
    'net.nanopay.ui.LoadingSpinner'
  ],

  exports: [
    'connectToBank'
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
      margin: 24px 0;
      padding: 0 24px;
    }
    ^field-label {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    ^ .property-username {
      width: 100%;
      height: 40px;
    }
    ^ .net-nanopay-ui-DataSecurityBanner {
      margin-top: 24px;
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
      }
    },
    {
      class: 'Password',
      name: 'password',
      view: {
        class: 'foam.u2.view.PasswordView',
        onKey: true
      }
    }
  ],

  messages: [
    { name: 'Username', message: 'Access Card # / Username' },
    { name: 'Password', message: 'Password' },
    { name: 'Connecting', message: 'Connecting... This may take a few minutes.'}
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
          .start('p').addClass(this.myClass('field-label')).add(this.Username).end()
          .tag(this.USERNAME)
          .start('p').addClass(this.myClass('field-label')).add(this.Password).end()
          .tag(this.PASSWORD)
          .start({ class: 'net.nanopay.ui.DataSecurityBanner' }).end()
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
          this.success();
          break;
        case 203:
          this.viewData.requestId = response.RequestId;
          this.viewData.securityChallenges = response.SecurityChallenges;
          this.notify('should go to security challenge screen', '')
          // this.pushToId('FlinksSecurityChallenge');
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
        X.connectToBank();
      }
    }
  ]
});
