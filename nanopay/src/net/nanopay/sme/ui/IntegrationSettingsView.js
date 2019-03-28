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
    'accountDAO',
    'quickbooksService',
    'user',
    'userDAO',
    'xeroService'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.accounting.AccountingBankAccount',
    'net.nanopay.accounting.IntegrationCode'
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
    ^ .accounting-logo {
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
    ^ .marginTop {
      margin-top: 25px;
    }
    ^ .inline-left-div {
      display: inline-block;
      vertical-align: top;
      float: left;
    }
    ^ .inline-right-div {
      display: inline-block;
      vertical-align: top;
      float: right;
    }
    ^ .drop-down-label {
      font-size: 12px;
      font-weight: 600;
      color: #2b2b2b;
      margin-bottom: 8px;
    }
    ^ .foam-u2-tag-Select {
      width: 330px;
      height: 40px;
      border-radius: 3px;
      box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
      margin-bottom: 16px;
      background-color: #ffffff;
    }
    ^ .net-nanopay-ui-ActionView {
      width: 96px !important;
      height: 36px !important;
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
    ^ .net-nanopay-ui-ActionView-save:hover {
      color: #4d38e1 !important;
    }
    ^ .net-nanopay-ui-ActionView:hover {
      background-color: #ffffff !important;
      color: #4d38e1;
      border-color: #4d38e1;
    }
    ^ .disconnect {
      border-color: #f91c1c;
      color: #f91c1c;
    }

    ^ .disconnect:hover {
      border-color: #e31313;
      color: #e31313;
    }
  `,

  messages: [
    { name: 'IntegrationsTitle', message: 'Integrations' },
    { name: 'BankMatchingTitle', message: 'Bank account matching' },
    { name: 'Connect', message: 'Connect' },
    { name: 'Disconnect', message: 'Disconnect' },
    { name: 'Connected', message: 'Connected' },
    { name: 'NotConnected', message: 'Not connected' },
    { name: 'YourBanksLabel', message: 'Your Ablii bank accounts' },
    { name: 'AccountingBanksLabel', message: 'Bank accounts in your accounting software' },
    { name: 'BankMatchingDesc1', message: 'Please select which accounts you would like to match between Ablii and Quickbooks/Xero from the drop downs.' },
    { name: 'BankMatchingDesc2', message: 'This will ensure that all transactions completed on Ablii are mapped and reconciled to the correct account in QuickBooks/Xero.' }
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
    },
    {
      name: 'bankMatchingLogo'
    },
    {
      class: 'Boolean',
      name: 'connected',
      value: false
    },
    {
      name: 'abliiBankData',
      factory: function() {
        var dao = this.user.accounts.where(
          this.OR(
            this.EQ(this.Account.TYPE, this.BankAccount.name),
            this.EQ(this.Account.TYPE, this.CABankAccount.name),
            this.EQ(this.Account.TYPE, this.USBankAccount.name)
          )
        );
        dao.of = this.BankAccount;
        return dao;
      }
    },
    {
      name: 'abliiBankList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          placeholder: '- Please Select -',
          dao: X.data.abliiBankData,
          objToChoice: function(account) {
            return [account.id, account.name];
          }
        });
      },
      postSet: async function(old, nu) {
        let selectedBank = await this.accountDAO.find(nu);
        var accountList = [];
        for ( i=0; i < this.accountingBankAccounts.bankAccountList.length; i++ ) {
          if ( selectedBank.denomination === this.accountingBankAccounts.bankAccountList[i].currencyCode ) {
            if ( this.user.integrationCode === this.IntegrationCode.XERO ) {
              accountList.push([this.accountingBankAccounts.bankAccountList[i].xeroBankAccountId, this.accountingBankAccounts.bankAccountList[i].name]);
            } else {
              accountList.push([this.accountingBankAccounts.bankAccountList[i].quickBooksBankAccountId, this.accountingBankAccounts.bankAccountList[i].name]);
            }
          }
        }
        this.accountingList = accountList;
      }
    },
    {
      name: 'accountingBankList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          placeholder: '- Please Select -',
          choices$: X.data.accountingList$
        });
      }
    },
    {
      class: 'Boolean',
      name: 'showXeroDisconected',
      value: false
    },
    {
      class: 'Boolean',
      name: 'showQuickBooksDisconected',
      value: false
    },
   'accountingBankAccounts',
   'accountingList'
  ],

  methods: [
    async function initE() {
      this.SUPER();
      let updatedUser = await this.userDAO.find(this.user.id);
      this.user.integrationCode = updatedUser.integrationCode;
      this.isXeroConnected();
      this.isQuickbooksConnected();
      if ( this.user.integrationCode == this.IntegrationCode.QUICKBOOKS ) {
        this.accountingBankAccounts = await this.quickbooksService.bankAccountSync(null);
      } else if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
        this.accountingBankAccounts = await this.xeroService.bankAccountSync(null);
      }
      if ( this.accountingBankAccounts ) {
        if ( ! this.accountingBankAccounts.result && this.accountingBankAccounts.errorCode.name === 'TOKEN_EXPIRED' ) {
          this.add(this.Popup.create({ closeable: false }).tag({
            class: 'net.nanopay.accounting.AccountingTimeOutModal'
          }));
        } else if ( ! this.accountingBankAccounts.result && ! this.accountingBankAccounts.errorCode.name === 'NOT_SIGNED_IN' ) {
          this.add(this.NotificationMessage.create({ message: this.accountingBankAccounts.reason, type: 'error' }));
        }
        this.accountingList = [];
        }
      this
        .addClass(this.myClass())
        .start().add(this.IntegrationsTitle).addClass('title').end()
        .start().addClass('integration-box')
          .start({ class: 'foam.u2.tag.Image', data: '/images/xero.png' }).addClass('accounting-logo').end()
          .start().addClass('integration-info-div')
            .start().add('Xero accounting').addClass('integration-box-title').end()
            .start().add(this.xeroConnected$).addClass('account-info').end()
          .end()
          .start(this.XERO_CONNECT, { label$: this.xeroBtnLabel$ }).enableClass('disconnect', this.showXeroDisconected$).end()
        .end()
        .start().addClass('integration-box')
          .start({ class: 'foam.u2.tag.Image', data: '/images/quickbooks.png' }).addClass('accounting-logo').end()
          .start().addClass('integration-info-div')
            .start().add('Intuit quickbooks').addClass('integration-box-title').end()
            .start().add(this.qbConnected$).addClass('account-info').end()
          .end()
          .start(this.QUICKBOOKS_CONNECT, { label$: this.qbBtnLabel$ }).enableClass('disconnect', this.showQuickBooksDisconected$).end()
        .end()
        .start().show(this.connected$)
          .start().add(this.BankMatchingTitle).addClass('title').end()
          .start().addClass('bank-matching-box')
            .start().addClass('inline-left-div')
              .start({ class: 'foam.u2.tag.Image', data: '/images/ablii-wordmark.svg' }).addClass('ablii-logo').end()
              .start().add('+').addClass('plus-sign').end()
              .start({ class: 'foam.u2.tag.Image', data: this.bankMatchingLogo$ }).addClass('qb-bank-matching').end()
              .start().add(this.BankMatchingDesc1).addClass('bank-matching-desc').end()
              .start().add(this.BankMatchingDesc2).addClass('bank-matching-desc').addClass('marginTop').end()
            .end()
            .start().addClass('inline-right-div')
              .start().add(this.YourBanksLabel).addClass('drop-down-label').end()
              .add(this.ABLII_BANK_LIST)
              .start().add(this.AccountingBanksLabel).addClass('drop-down-label').end()
              .add(this.ACCOUNTING_BANK_LIST)
              .start(this.SAVE).end()
            .end()
          .end()
        .end()
      .end();
    },
    function isXeroConnected() {
      if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
        this.xeroBtnLabel = this.Disconnect;
        this.xeroConnected = this.Connected;
        this.bankMatchingLogo = '/images/xero.png';
        this.showXeroDisconected = true;
      } else {
        this.xeroBtnLabel = this.Connect;
        this.xeroConnected = this.NotConnected;
        this.showXeroDisconected = false;
      }
      this.checkForConnections();
    },
    function isQuickbooksConnected() {
      if ( this.user.integrationCode == this.IntegrationCode.QUICKBOOKS  ) {
        this.qbBtnLabel = this.Disconnect;
        this.qbConnected = this.Connected;
        this.bankMatchingLogo = '/images/quickbooks.png';
        this.showQuickBooksDisconected = true;
      } else {
        this.qbBtnLabel = this.Connect;
        this.qbConnected = this.NotConnected;
        this.showQuickBooksDisconected = false;
      }
      this.checkForConnections();
    },
    function checkForConnections() {
      if ( this.xeroConnected == 'Connected' || this.qbConnected == 'Connected' ) {
        this.connected = true;
      } else {
        this.connected = false;
      }
    },
    function attachSessionId(url) {
      // attach session id if available
      var sessionId = localStorage['defaultSession'];
      if ( sessionId ) {
        url += '&sessionId=' + sessionId;
      }
      return url;
    }
  ],

  actions: [
    {
      name: 'xeroConnect',
      code: function() {
        var self = this;
        if ( this.xeroBtnLabel == this.Disconnect ) {
          this.xeroService.removeToken(null, this.user).then(function(result) {
            self.xeroBtnLabel = this.Connect;
            self.xeroConnected = this.NotConnected;
            self.add(self.NotificationMessage.create({ message: 'Xero integration has been disconnected' }));
            self.connected = false;
            self.showXeroDisconected = false;
          })
          .catch(function(err) {
            self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
          });
        } else {
          if ( this.user.integrationCode == this.IntegrationCode.QUICKBOOKS ) {
            this.quickbooksService.removeToken(null);
          }
          var url = window.location.origin + '/service/xeroWebAgent?portRedirect=' + window.location.hash.slice(1);
          window.location = this.attachSessionId(url);
        }
      }
    },
    {
      name: 'quickbooksConnect',
      code: function() {
        var self = this;
        if ( this.qbBtnLabel == this.Disconnect ) {
          this.quickbooksService.removeToken(null, this.user).then(function(result) {
            self.qbBtnLabel = this.Connect;
            self.qbConnected = this.NotConnected;
            self.add(self.NotificationMessage.create({ message: 'Intuit quickbooks integration has been disconnected' }));
            self.connected = false;
            self.showQuickBooksDisconected = false;
          })
          .catch(function(err) {
            self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
          });
        } else {
          if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
            this.xeroService.removeToken(null);
          }
          var url = window.location.origin + '/service/quickbooksWebAgent?portRedirect=' + window.location.hash.slice(1);
          window.location = this.attachSessionId(url);
        }
      }
    },
    {
      name: 'save',
      label: 'Save',
      code: async function() {
        var self = this;

        if ( this.accountingBankList == undefined || this.abliiBankList == undefined ) {
          this.add(this.NotificationMessage.create({ message: 'Please select which accounts you want to link', type: 'error' }));
          return;
        }

        var abliiBank = await this.accountDAO.find(this.abliiBankList);
        abliiBank.integrationId = this.accountingBankList;
        this.accountDAO.put(abliiBank).then(function(result) {
          self.add(self.NotificationMessage.create({ message: 'Accounts have been successfully linked' }));
          self.accountingBankList = -1;
        });
      }
    }
  ]
});
