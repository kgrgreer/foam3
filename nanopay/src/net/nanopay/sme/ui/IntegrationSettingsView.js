foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'IntegrationSettingsView',
  extends: 'foam.u2.Controller',

  documentation: `View to display list of third party services 
                  the user can integrate with`,

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'quickSignIn',
    'user',
    'xeroSignIn'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount'
  ],

  css: `
    ^ .title {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: normal;
      color: #2b2b2b;
      margin-bottom: 16px;
    }
    ^ .integration-box {
      width: 456px;
      height: 42px;
      border-radius: 3px;
      box-shadow: 1px 1.5px 1.5px 1px #dae1e9;
      background-color: #ffffff;
      display: inline-block;
      margin-right: 16px;
      margin-bottom: 24px;
      padding: 15px 24px 15px 24px;
      vertical-align: middle;
    }
    ^ .xero-logo {
      position: relative;
      bottom: 8.5;
      width: 57px;
      height: 57px;
      display: inline-block;
    }
    ^ .qb-logo {
      position: relative;
      top: 1;
      width: 39px;
      height: 39px;
      display: inline-block;
      margin-left: 6px;
      margin-right: 8px;
    }
    ^ .qb-bank-matching {
      width: 39px;
      height: 39px;
      display: inline-block;
    }
    ^ .ablii-logo {
      margin-left: 12px;
      display: inline-block;
      width: 130px;
    }
    ^ .integration-box-title {
      font-size: 14px;
      font-weight: 900;
      color: #2b2b2b;
    }
    ^ .integration-info-div {
      margin-left: 10px;
      vertical-align: top;
      display: inline-block;
    }
    ^ .account-info {
      font-size: 14px;
      color: #8e9090;
      margin-top: 7px;
    }
    ^ .bank-matching-box {
      width: 976px;
      height: 204px;
      border-radius: 3px;
      background-color: white;
      box-shadow: 1px 1.5px 1.5px 1px #dae1e9;
      padding: 24px;
    }
    ^ .plus-sign {
      position: relative;
      bottom: 15;
      margin-left: 16px;
      margin-right: 16px;
      display: inline-block;
      font-size: 16px;
      font-weight: 900;
      color: #2b2b2b;
    }
    ^ .bank-matching-desc {
      width: 480px;
      font-size: 16px;
      color: #525455;
      margin-left: 12px;
      margin-top: 16px;
    }
    ^ .bank-matching-block-div {
      display: inline-block;
    }
    ^ .net-nanopay-ui-ActionView {
      width: 96px;
      height: 36px;
      border-radius: 4px;
      border: 1px solid #604aff;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      background-color: #ffffff;
      float: right;
      font-size: 14px;
      font-weight: 600;
      color: #604aff;
      margin-top: 3px;
    }
    ^ .net-nanopay-ui-ActionView:hover {
      color: white;
    }
  `,

  messages: [
    { name: 'IntegrationsTitle', message: 'Integrations' },
    { name: 'BankMatchingTitle', message: 'Bank account matching' },
    { name: 'Connect', message: 'Connect' },
    { name: 'Disconnect', message: 'Disconnect' },
    { name: 'Connected', message: 'Connected' },
    { name: 'NotConnected', message: 'Not connected' },
    { name: 'BankMatchingDesc', message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum semper commodo quam, non lobortis justo fermentum non.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum semper commodo quam, non lobortis justo fermentum non' }
  ],

  properties: [
    {
      name: 'qbBtnLabel',
      value: 'Connect'
    },
    {
      name: 'xeroBtnLabel',
      value: 'Connect'
    },
    {
      name: 'xeroConnected',
      value: 'Not connected'
    },
    {
      name: 'qbConnected',
      value: 'Not connected'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.isXeroConnected();
      this.isQuickbooksConnected();

      this
        .addClass(this.myClass())
        .start().add(this.IntegrationsTitle).addClass('title').end()
        .start().addClass('integration-box')
          .start({ class: 'foam.u2.tag.Image', data: '/images/setting/integration/xero_logo.svg' }).addClass('xero-logo').end()
          .start().addClass('integration-info-div')
            .start().add('Xero accounting').addClass('integration-box-title').end()
            .start().add(this.xeroConnected$).addClass('account-info').end()
          .end()
          .start(this.XERO_CONNECT, { label$: this.xeroBtnLabel$ }).end()
        .end()
        .start().addClass('integration-box')
          .start({ class: 'foam.u2.tag.Image', data: '/images/setting/integration/quickbooks_logo.png' }).addClass('qb-logo').end()
          .start().addClass('integration-info-div')
            .start().add('Intuit quickbooks').addClass('integration-box-title').end()
            .start().add(this.qbConnected$).addClass('account-info').end()
          .end()
          .start(this.QUICKBOOKS_CONNECT, { label$: this.qbBtnLabel$ }).end()
        .end()
        .start().add(this.BankMatchingTitle).addClass('title').end()
        .start().addClass('bank-matching-box')
          .start().addClass('bank-matching-block-div')
            .start({ class: 'foam.u2.tag.Image', data: '/images/ablii-wordmark.svg' }).addClass('ablii-logo').end()
            .start().add('+').addClass('plus-sign').end()
            .start({ class: 'foam.u2.tag.Image', data: '/images/setting/integration/quickbooks_logo.png' }).addClass('qb-bank-matching').end()
            .start().add(this.BankMatchingDesc).addClass('bank-matching-desc').end()
          .end()
          .start().addClass('bank-matching-block-div')
            
          .end()
        .end()
      .end();
    },
    async function isXeroConnected() {
      var result = await this.xeroSignIn.isSignedIn(null, this.user);
      if ( result.result ) {
        this.xeroBtnLabel = this.Disconnect;
        this.xeroConnected = this.Connected;
      } else {
        this.xeroBtnLabel = this.Connect;
        this.xeroConnected = this.NotConnected;
      }
    },
    async function isQuickbooksConnected() {
      var result = await this.quickSignIn.isSignedIn(null, this.user);
      if ( result.result ) {
        this.qbBtnLabel = this.Disconnect;
        this.qbConnected = this.Connected;
      } else {
        this.qbBtnLabel = this.Connect;
        this.qbConnected = this.NotConnected;
      }
    }
  ],

  actions: [
    {
      name: 'xeroConnect',
      code: function() {
        var self = this;
        if ( this.xeroBtnLabel == this.Disconnect ) {
          this.xeroSignIn.removeToken(null, this.user).then(function(result) {
            self.xeroBtnLabel = this.Connect;
            self.xeroConnected = this.NotConnected;
            self.add(self.NotificationMessage.create({ message: 'Xero integration has been disconnected' }));
          })
          .catch(function(err) {
            self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
          });
        } else {
          var url = window.location.origin + '/service/xero?portRedirect=' + window.location.hash.slice(1);
          window.location = url;
        }
      }
    },
    {
      name: 'quickbooksConnect',
      code: function() {
        var self = this;
        if ( this.qbBtnLabel == this.Disconnect ) {
          this.quickSignIn.removeToken(null, this.user).then(function(result) {
            self.qbBtnLabel = this.Connect;
            self.qbConnected = this.NotConnected;
            self.add(self.NotificationMessage.create({ message: 'Intuit quickbooks integration has been disconnected' }));
          })
          .catch(function(err) {
            self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
          });
        } else {
          var url = window.location.origin + '/service/quick?portRedirect=' + window.location.hash.slice(1);
          window.location = url;
        }
      }
    }
  ]
});
