foam.CLASS({
  package: 'net.nanopay.accounting.ui',
  name: 'AccountingBankMatching',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO',
    'pushMenu',
    'quickbooksService',
    'stack',
    'user',
    'xeroService',
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.accounting.IntegrationCode'
  ],

  css: `
    ^ {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
      overflow-y: scroll;
      background-color: /*%GREY5%*/ #f5f7fa;
    }
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
      height: calc(100vh - 92px);
    }
    ^ .button-bar {
      margin-top:20px;
      height: 48px;
      background-color: #ffffff;
      padding-top: 12px;
      padding-bottom: 12px;
      padding-right: 24px;
    }
    ^ .bank-matching-box {
      background-color: /*%GREY5%*/ #f5f7fa;
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
    ^ .save-button {
      width: 158px;
      height: 48px !important;
      border-radius: 4px;
      border: 1px solid #4a33f4;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      background-color: #604aff !important;
      font-size: 16x !important;
      margin-right: 24px;
      font-weight: 400;
      float: right;
      color: #FFFFFF !important;
    }
    ^ .foam-u2-ActionView-save:hover {
      background-color: #4d38e1 !important;
    }
    ^ .bank-matching{
      height: 40px;
    }
    ^ .cancel-button {
      float: left;
      background-color: transparent;
      color: #525455;
      border: none;
      box-shadow: none;
      width: 158;
      height: 48;
      margin-left: 128px;
      font-size: 16px;
      font-weight: lighter;
    }
    ^ .cancel-button:hover {
      cursor : selector;
      background-color: transparent !important
    }
    ^ .validation-failure-container {
      font-size: 10px;
      color: #d0021b;
      margin-bottom: 10px;
    }
    ^ .failure-text {
      float: right;
      font-size: 12px;
      margin-top: 4px;
      margin-right: 57px;
    }
    ^ .failure-text1 {
      float: right;
      font-size: 12px;
      margin-top: 4px;
      margin-right: 154px;
    }
    ^ .failure-text2 {
      float: right;
      font-size: 12px;
      margin-top: 4px;
      margin-right: 95px;
    }
    ^ .error-box .foam-u2-tag-Select {
      border-color: #f91c1c;
      background: #fff6f6;
    }

    ^ error
  `,

  messages: [
    { name: 'YourBanksLabel', message: 'Your Ablii bank accounts' },
    { name: 'AccountingBanksLabel', message: 'Bank accounts in your accounting software' },
    { name: 'BankMatchingDesc1', message: 'Please select which accounts you would like to match between Ablii and ' },
    { name: 'BankMatchingDesc2', message: ' from the drop downs.' },
    { name: 'BankMatchingDesc3', message: 'This will ensure that all transactions completed on Ablii are mapped and reconciled to the correct account in ' },
    { name: 'BankMatchingTitle', message: 'Bank account matching' },
    { name: 'TokenExpired', message: 'Your connection to the accounting software has expired. Please sync again.' }
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
      name: 'abliiBankList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          placeholder: '- Please Select -',
          dao: X.data.abliiBankData,
          objToChoice: function(account) {
            return [account.id, account.name + '-' + account.denomination];
          }
        });
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
      name: 'isLandingPage',
      value: false
    },
    'accountingBankAccounts',
    'accountingList',
    {
      class: 'Boolean',
      name: 'showPickBank',
      value: false
    },
    {
      class: 'Boolean',
      name: 'showPickBankAblii',
      value: false
    },
    {
      class: 'Boolean',
      name: 'showMatchCurrency',
      value: false
    }
  ],

  methods: [
    async function initE() {
      let bankAccountList = [];
      if ( this.user.integrationCode == this.IntegrationCode.QUICKBOOKS ) {
        this.accountingBankAccounts = await this.quickbooksService.bankAccountSync(null);
      } else if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
        this.accountingBankAccounts = await this.xeroService.bankAccountSync(null);
      }
      if ( ! this.accountingBankAccounts.result && this.accountingBankAccounts.errorCode.name === 'TOKEN_EXPIRED' ) {
        this.add(this.NotificationMessage.create({ message: this.TokenExpired, type: 'error' }));
      } else if ( ! this.accountingBankAccounts.result && ! this.accountingBankAccounts.errorCode.name === 'NOT_SIGNED_IN' ) {
        this.add(this.NotificationMessage.create({ message: this.accountingBankAccounts.reason, type: 'error' }));
      }
      if ( this.accountingBankAccounts ) {
        for ( i=0; i < this.accountingBankAccounts.bankAccountList.length; i++ ) {
          if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
            bankAccountList.push([this.accountingBankAccounts.bankAccountList[i].xeroBankAccountId, this.accountingBankAccounts.bankAccountList[i].name + '-' + this.accountingBankAccounts.bankAccountList[i].currencyCode]);
          } else {
            bankAccountList.push([this.accountingBankAccounts.bankAccountList[i].quickBooksBankAccountId, this.accountingBankAccounts.bankAccountList[i].name+ '-' + this.accountingBankAccounts.bankAccountList[i].currencyCode]);
          }
        }
      }
      this.accountingList = bankAccountList;

      this
        .start().addClass(this.myClass())
        .start().addClass('bank-matching-container')
          .start().addClass('bank-matching-box')
            .start().add(this.BankMatchingTitle).addClass('title').end()
            .start({ class: 'foam.u2.tag.Image', data: '/images/ablii-wordmark.svg' }).addClass('ablii-logo').end()
            .start().add('+').addClass('plus-sign').end()
            .start({ class: 'foam.u2.tag.Image', data: this.bankMatchingLogo$ }).addClass('bank-matching').end()
            .start().add(this.BankMatchingDesc1 + this.user.integrationCode.label + this.BankMatchingDesc2).addClass('bank-matching-desc').end()
            .start().add(this.BankMatchingDesc3 + this.user.integrationCode.label ).addClass('bank-matching-desc').addClass('marginTop').end()
            .start().add(this.YourBanksLabel).addClass('drop-down-label').end()
            .start()
              .add(this.ABLII_BANK_LIST).enableClass('error-box', this.showPickBankAblii$)
            .end()
            .start().show(this.showPickBankAblii$)
              .addClass('validation-failure-container')
              .start('img')
                .addClass('small-error-icon')
                .attrs({ src: 'images/inline-error-icon.svg' })
              .end()
              .start()
                .add('Please select a bank account from Ablii before matching.').addClass('failure-text1')
              .end()
            .end()
            .start().add(this.AccountingBanksLabel).addClass('drop-down-label').end()
            .start()
              .start()
                .add(this.ACCOUNTING_BANK_LIST).enableClass('error-box', this.showPickBank$)
              .end()
              .start().show(this.slot(
                function(showMatchCurrency, showPickBank) {
                  return showMatchCurrency || showPickBank;
                }))
                .addClass('validation-failure-container')
                .start('img')
                  .addClass('small-error-icon')
                  .attrs({ src: 'images/inline-error-icon.svg' })
                .end()
                .start().show(this.showPickBank$)
                  .add('Please select a bank account in your accounting software before matching.').addClass('failure-text')
                .end()
                .start().show(this.showMatchCurrency$)
                  .add('Please select an appropriate bank account in the same currency.').addClass('failure-text2')
                .end()
              .end()
            .end()
          .end()
        .end()
        .start().addClass('button-bar')
          .start(this.CANCEL).addClass('cancel-button').end()
          .start(this.SAVE).addClass('save-button').end()
        .end()
      .end();
    },

    function isConnected() {

      if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
        this.bankMatchingLogo = '/images/xero.png';
        return true;
      }

      if ( this.user.integrationCode == this.IntegrationCode.QUICKBOOKS ) {
        this.bankMatchingLogo = '/images/quickbooks.png';
        return true;
      }

      return false;
    }
  ],

  actions: [
    {
      name: 'save',
      label: 'Save',
      code: async function(X) {
        if ( this.accountingBankList == undefined || this.abliiBankList == undefined ) {
          this.showMatchCurrency = false;
          this.showPickBankAblii = this.abliiBankList == undefined ? true: false;
          this.showPickBank = this.accountingBankList == undefined ? true: false;
          return;
        }
        this.showPickBank = false;
        this.showPickBankAblii = false;

        var abliiBank = await this.accountDAO.find(this.abliiBankList);
        let accountingBank = null;
        for ( i=0; i < this.accountingBankAccounts.bankAccountList.length; i++ ) {
          if ( this.accountingBankAccounts.bankAccountList[i].xeroBankAccountId === this.accountingBankList ) {
            accountingBank = this.accountingBankAccounts.bankAccountList[i];
            break;
          } else if ( this.accountingBankAccounts.bankAccountList[i].quickBooksBankAccountId === this.accountingBankList ) {
            accountingBank = this.accountingBankAccounts.bankAccountList[i];
            break;
          }
        }

        if ( ! ( abliiBank.denomination === accountingBank.currencyCode ) ) {
          this.showMatchCurrency = true;
          return;
        }
        this.showMatchCurrency = false;

        abliiBank.integrationId = accountingBank.xeroBankAccountId ? accountingBank.xeroBankAccountId: accountingBank.quickBooksBankAccountId;
        await this.accountDAO.put(abliiBank);
        this.add(this.NotificationMessage.create({ message: 'Accounts have been successfully linked' }));
        this.accountingBankList = -1;
        // to report sync loading page
        this.stack.push({
          class: 'net.nanopay.accounting.ui.AccountingCallbackPage',
          doSync: true
        })
        
      }
    },
    {
      name: 'cancel',
      label: 'Cancel',
      code: async function(X) {
        if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
          await this.xeroService.removeToken(null);
        } else if ( this.user.integrationCode == this.IntegrationCode.QUICKBOOKS ) {
          await this.quickbooksService.removeToken(null);
        }
        this.pushMenu('sme.main.dashboard');
      }
    }
  ]
});
