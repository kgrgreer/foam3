foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'IntegrationPopUpView',
  extends: 'foam.u2.Controller',

  documentation: 'View to display bank matching for integrations',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO',
    'bankIntegrationsDAO',
    'pushMenu',
    'quickSignIn',
    'user',
    'xeroSignIn'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount'
  ],

  css: `
    ^ {
      text-align: center
    }
    ^ .title {
      font-size: 24px;
      font-weight: 900;
      color: black;
    }
    ^ .bank-matching-box {
      width: 476px;
      height: 476px;
      background-color: white;
      border-radius: 3px;
      box-shadow: 1px 1.5px 1.5px 1px #dae1e9;
      padding: 24px;
      display: inline-block;
      text-align: left;
    }
    ^ .ablii-logo {
      margin-top: 30px;
      display: inline-block;
      width: 130px;
    }
    ^ .drop-down-label {
      font-size: 12px;
      font-weight: 600;
      color: #2b2b2b;
      margin-bottom: 8px;
    }
    ^ .foam-u2-tag-Select {
      width: 480px;
      height: 40px;
      border-radius: 3px;
      box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
      margin-bottom: 16px;
      background-color: #ffffff;
    }
    ^ .bank-matching-desc {
      width: 480px;
      font-size: 16px;
      color: #525455;
      margin-top: 16px;
      margin-bottom: 25px;
    }
    ^ .marginTop {
      margin-top: 25px;
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
    ^ .net-nanopay-ui-ActionView-save {
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
    ^ .net-nanopay-ui-ActionView-save:hover {
      color: white;
    }
    ^ .bank-matching{
      height: 40px;
    }
    ^ .net-nanopay-ui-ActionView-cancel {
      width: 96px;
      height: 36px;
      box-shadow: none;
      background-color: #ffffff;
      float: right;
      font-size: 14px;
      font-weight: 600;
      color: #525455;
      margin-top: 3px;
      margin-right: 10px;
    }
    ^ .net-nanopay-ui-ActionView-cancel:hover {
      background: none;
    }
  `,

  messages: [
    { name: 'YourBanksLabel', message: 'Your Ablii bank accounts' },
    { name: 'AccountingBanksLabel', message: 'Bank accounts in your accounting software' },
    { name: 'BankMatchingDesc1', message: 'Please select which accounts you would like to match between Ablii and Quickbooks/Xero from the drop downs.' },
    { name: 'BankMatchingDesc2', message: 'This will ensure that all transactions completed on Ablii are mapped and reconciled to the correct account in QuickBooks/Xero.' },
    { name: 'BankMatchingTitle', message: 'Bank account matching' }
  ],

  properties: [
    {
      name: 'bankMatchingLogo'
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
      name: 'accountingBankData',
      factory: function() {
        return this.bankIntegrationsDAO;
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
      }
    },
    {
      name: 'accountingBankList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          placeholder: '- Please Select -',
          dao: X.data.accountingBankData,
          objToChoice: function(account) {
            return [account.id, account.name];
          }
        });
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.isXeroConnected();
      this.isQuickbooksConnected();

      this
        .addClass(this.myClass())
        .start().addClass('bank-matching-box')
        .start().add(this.BankMatchingTitle).addClass('title').end()
          .start({ class: 'foam.u2.tag.Image', data: '/images/ablii-wordmark.svg' }).addClass('ablii-logo').end()
          .start().add('+').addClass('plus-sign').end()
          .start({ class: 'foam.u2.tag.Image', data: this.bankMatchingLogo$ }).addClass('bank-matching').end()
          .start().add(this.BankMatchingDesc1).addClass('bank-matching-desc').end()
          .start().add(this.BankMatchingDesc2).addClass('bank-matching-desc').addClass('marginTop').end()
          .start().add(this.YourBanksLabel).addClass('drop-down-label').end()
          .add(this.ABLII_BANK_LIST)
          .start().add(this.AccountingBanksLabel).addClass('drop-down-label').end()
          .add(this.ACCOUNTING_BANK_LIST)
          .start(this.SAVE).end()
          .start(this.CANCEL).end()
        .end();
    },
    async function isXeroConnected() {
      var result = await this.xeroSignIn.isSignedIn(null);
      if ( result.result ) {
        this.bankMatchingLogo = '/images/xero.png';
      }
    },
    async function isQuickbooksConnected() {
      var result = await this.quickSignIn.isSignedIn(null);
      if ( result.result ) {
        this.bankMatchingLogo = '/images/quickbooks.png';
      }
    },
  ],

  actions: [
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
          self.pushMenu('sme.main.dashboard');
        });
      }
    },
    {
      name: 'cancel',
      label: 'Cancel',
      code: function() {
        this.pushMenu('sme.main.dashboard');
      }
    }
  ]
});
