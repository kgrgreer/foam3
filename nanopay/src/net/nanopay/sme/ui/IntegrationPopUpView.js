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
    ^ .bank-matching-container {
      width: 530px;
      display: inline-block;
      
    }
    ^ .bank-matching-box {
      background-color: white;
      padding: 24px;
      border-top-right-radius: 5px;
      border-top-left-radius: 5px;
      text-align: left;
      display: inline-block;
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
      height: 36px !important;
      border-radius: 4px;
      border: 1px solid #4a33f4;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      background-color: #604aff !important;
      font-size: 14px !important;
      font-weight: 400;
      color: #FFFFFF !important;
    }
    ^ .net-nanopay-ui-ActionView-save:hover {
      background-color: #4d38e1 !important;
    }
    ^ .bank-matching{
      height: 40px;
    }
    ^ .net-nanopay-ui-ActionView-cancel {
      background-color: transparent;
      color: #525455;
      border: none;
      box-shadow: none;
      width: auto;
      height: auto;
      margin-right: 24px;
      font-size: 14px;
      font-weight: lighter;
    }
    ^ .net-nanopay-ui-ActionView-cancel:hover {
      cursor : selector;
      background-color: transparent !important
    }
    ^ .bank-matching-action-box {
      background: #fafafa;
      padding: 24px;
      background-color: #fafafa;
      box-sizing: border-box;
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      text-align: right;
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
    async function initE() {
      this.SUPER();

      let service = null;
      let parsedUrl = new URL(window.location.href);

      if ( parsedUrl.searchParams.get("accounting") === "xero" ) {
        service = this.xeroSignIn;
      }

      if ( parsedUrl.searchParams.get("accounting") === "quickbook" ) {
        service = this.quickSignIn;
      }

      let contacts = await service.contactSync(null);
      let invoices = await service.invoiceSync(null);

      // push the user to dashboard

      this
        .addClass(this.myClass())
        .start().addClass('bank-matching-container')
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
          .end()
          .start().addClass('bank-matching-action-box')
            .start(this.CANCEL).end()
            .start(this.SAVE).end()
          .end()
        .end()
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
          self.accountingBankList = -1;
          self.pushMenu('sme.main.dashboard');
        });
      }
    },
    {
      name: 'cancel',
      label: 'Cancel',
      code: function() {
        // this.pushMenu('sme.main.dashboard');
        this.quickSignIn.invoiceSync(null);
      }
    }
  ]
});
