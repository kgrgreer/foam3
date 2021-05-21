/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
    'accountingIntegrationUtil',
    'ctrl',
    'notify',
    'quickbooksService',
    'user',
    'userDAO',
    'xeroService',
    'theme'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.u2.dialog.Popup',
    'net.nanopay.account.Account',
    'net.nanopay.accounting.AccountingErrorCodes',
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
      color: /*%BLACK%*/ #1e1f21;
      margin-bottom: 16px;
    }
    ^ .integration-box {
      width: 456px;
      height: 42px;
      border-radius: 3px;
      box-shadow: 1px 1.5px 1.5px 1px #dae1e9;
      background-color: #ffffff;
      display: inline-flex;
      justify-content: space-between;
      align-items: center;
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
      color: /*%BLACK%*/ #1e1f21;
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
      height: 240px;
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
      color: /*%BLACK%*/ #1e1f21;
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
      width: 50%;
      height: 80%;
    }
    ^ .inline-right-div {
      text-align: center;
      display: inline-block;
      vertical-align: top;
      padding-top: 10px;
      width: 50%;
      height: 80%;
    }
    ^ .inline-bottom-div {
      display: inline-block;
      padding-top: 4px;
      vertical-align: top;
      width: 100%;
      height: 20%;
    }
    ^ .drop-down-label {
      font-size: 12px;
      font-weight: 600;
      color: /*%BLACK%*/ #1e1f21;
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
    ^ .foam-u2-ActionView {
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
    ^ .foam-u2-ActionView-save:hover {
      color: #4d38e1 !important;
    }
    ^ .foam-u2-ActionView:hover {
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
    ^ .validation-failure-container {
      font-size: 10px;
      color: #d0021b;
      margin-bottom: 10px;
    }
    ^ .failure-text {
      float: right;
      font-size: 12px;
      margin-top: 4px;
      margin-right: 96px;
    }
    ^ .failure-icon {
      margin-right: -77px;
    }
    ^ .failure-text-AS {
      float: right;
      font-size: 12px;
      margin-top: 4px;
      margin-right: 40px;
    }
    ^ .failure-text2 {
      float: right;
      font-size: 12px;
      margin-top: 4px;
      margin-right: 95px;
    }
    .dropdown {
      margin-bottom: -15px;
    }
    .error-box .foam-u2-tag-Select {
      border-color: #f91c1c;
      background: #fff6f6;
    }
    ^ .hidden {
      visibility: hidden;
    }
    ^ .show {
      visibility: visible;
    }
    ^ .token-expired-desc {
      margin-top: 16px;
      margin-left: 12px;
      color: #f91c1c;
      font-size: 13px;
    }
  `,

  messages: [
    { name: 'INTEGRATIONS_TITLE', message: 'Integrations' },
    { name: 'BANK_MATCHING_TITLE', message: 'Bank account matching' },
    { name: 'CONNECT_LABEL', message: 'Connect' },
    { name: 'DISCONNECT_LABEL', message: 'Disconnect' },
    { name: 'CONNECTED_LABEL', message: 'Connected' },
    { name: 'NOT_CONNECTED_LABEL', message: 'Not connected' },
    { name: 'ACCOUNTING_BANKS_LABEL', message: 'Bank accounts in your accounting software' },
    { name: 'BANK_MATCHING_DESC_1', message: 'Please select which accounts you would like to match between ' },
    { name: 'BANK_MATCHING_DESC_2', message: ' from the drop downs.' },
    { name: 'BANK_MATCHING_DESC_3', message: 'This will ensure that all transactions completed on ' },
    { name: 'BANK_MATCHING_DESC_4', message: ' are mapped and reconciled to the correct account in ' },
    { name: 'TOKEN_EXPIRED', message: 'Please sync again to your accounting software to fetch the latest information.' },
    { name: 'YOUR', message: 'Your ' },
    { name: 'BANK_ACCOUNT', message: ' bank accounts' },
    { name: 'PLEASE_SELECT_BANK', message: 'Please select a bank account in ' },
    { name: 'BEFORE_MATCH', message: ' before matching.' }
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
            this.INSTANCE_OF(this.CABankAccount),
            this.INSTANCE_OF(this.USBankAccount)
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
      },
      postSet: function(old, nu) {
        if ( nu != '- Please Select -' ) {
          this.showPickBankAblii = false;
        }
      }
    },
    {
      name: 'accountingBankList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          placeholder: '- Please Select -',
          choices$: X.data.accountingList$
        });
      },
      postSet: function(old, nu) {
        if ( nu != '- Please Select -' ) {
          this.showPickBank = false;
        }
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
   },
   {
     class: 'Boolean',
     name: 'displayExpiredTokenMessage',
     value: false
   }
  ],

  methods: [
    async function initE() {
      this.SUPER();
      let showIntegrationButtons = await this.accountingIntegrationUtil.getPermission();
      let updatedUser = await this.userDAO.find(this.user.id);
      this.user.integrationCode = updatedUser.integrationCode;
      this.isXeroConnected();
      this.isQuickbooksConnected();
      let bankAccountList = [];
      if ( this.user.integrationCode == this.IntegrationCode.QUICKBOOKS ) {
        this.accountingBankAccounts = await this.quickbooksService.bankAccountSync(null);
      } else if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
        this.accountingBankAccounts = await this.xeroService.bankAccountSync(null);
      }
      if ( this.accountingBankAccounts ) {
        if ( this.accountingBankAccounts.errorCode == this.AccountingErrorCodes.TOKEN_EXPIRED ) {
          this.displayExpiredTokenMessage = true;
        }
        for ( let i = 0; i < this.accountingBankAccounts.bankAccountList.length; i++ ) {
          if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
            bankAccountList.push([this.accountingBankAccounts.bankAccountList[i].xeroBankAccountId, this.accountingBankAccounts.bankAccountList[i].name + '-' + this.accountingBankAccounts.bankAccountList[i].currencyCode]);
          } else {
            bankAccountList.push([this.accountingBankAccounts.bankAccountList[i].quickBooksBankAccountId, this.accountingBankAccounts.bankAccountList[i].name+ '-' + this.accountingBankAccounts.bankAccountList[i].currencyCode]);
          }
        }
      }
      this.accountingList = bankAccountList;
      this
        .addClass(this.myClass()).show(showIntegrationButtons[0])
        .start().add(this.INTEGRATIONS_TITLE).addClass('title').end()
        .start().addClass('integration-box').show(showIntegrationButtons[1])
          .start()
            .start({ class: 'foam.u2.tag.Image', data: '/images/xero.png' }).addClass('accounting-logo').end()
            .start().addClass('integration-info-div')
              .start().add('Xero accounting').addClass('integration-box-title').end()
              .start().add(this.xeroConnected$).addClass('account-info').end()
            .end()
          .end()
          .start(this.XERO_CONNECT, {
            label$: this.xeroBtnLabel$,
            buttonStyle: 'SECONDARY'
          }).enableClass('disconnect', this.showXeroDisconected$).end()
        .end()
        .start().addClass('integration-box').show(showIntegrationButtons[2])
          .start()
            .start({ class: 'foam.u2.tag.Image', data: '/images/quickbooks.png' }).addClass('accounting-logo').end()
            .start().addClass('integration-info-div')
              .start().add('Intuit quickbooks (BETA)').addClass('integration-box-title').end()
              .start().add(this.qbConnected$).addClass('account-info').end()
            .end()
          .end()
          .start(this.QUICKBOOKS_CONNECT, {
            label$: this.qbBtnLabel$,
            buttonStyle: 'SECONDARY'
          }).enableClass('disconnect', this.showQuickBooksDisconected$).end()
        .end()
        .start().show(this.connected$)
          .start().add(this.BANK_MATCHING_TITLE).addClass('title').end()
          .start().addClass('bank-matching-box')
            .start().addClass('inline-left-div')
              .start({ class: 'foam.u2.tag.Image', data: '/images/ablii-wordmark.svg' }).addClass('ablii-logo').end()
              .start().add('+').addClass('plus-sign').end()
              .start({ class: 'foam.u2.tag.Image', data: this.bankMatchingLogo$ }).addClass('qb-bank-matching').end()
              .start().add(this.BANK_MATCHING_DESC_1 + `${this.theme.appName} and ` + this.user.integrationCode.label + this.BANK_MATCHING_DESC_2).addClass('bank-matching-desc').end()
              .start().add(this.BANK_MATCHING_DESC_3 + this.theme.appName + this.BANK_MATCHING_DESC_4 + this.user.integrationCode.label ).addClass('bank-matching-desc').addClass('marginTop').end()
              .start()
                .show(this.displayExpiredTokenMessage)
                .add(this.TOKEN_EXPIRED)
                .addClass('token-expired-desc')
              .end()
            .end()
            .start().addClass('inline-right-div')
              .start().add(this.YOUR + this.theme.appName + this.BANK_ACCOUNT).addClass('drop-down-label').end()
              .start()
                .add(this.ABLII_BANK_LIST).addClass('dropdown').enableClass('error-box', this.showPickBankAblii$)
              .end()
              .start().addClass('hidden').enableClass('show', this.showPickBankAblii$)
                .addClass('validation-failure-container')
                .start('img').addClass('failure-icon')
                  .addClass('small-error-icon')
                  .attrs({ src: 'images/inline-error-icon.svg' })
                .end()
                .start()
                  .add(this.PLEASE_SELECT_BANK + this.theme.appName + this.BEFORE_MATCH).addClass('failure-text')
                .end()
              .end()
              .start().add(this.ACCOUNTING_BANKS_LABEL).addClass('drop-down-label').end()
              .start()
                .add(this.ACCOUNTING_BANK_LIST).addClass('dropdown').enableClass('error-box', this.showPickBank$)
              .end()
              .start().addClass('hidden').enableClass('show', this.slot(
                function(showMatchCurrency, showPickBank) {
                  return showMatchCurrency || showPickBank;
                }))
                .addClass('validation-failure-container')
                .start('img')
                  .addClass('small-error-icon')
                  .attrs({ src: 'images/inline-error-icon.svg' })
                .end()
                .start().show(this.showPickBank$)
                  .add('Please select a bank account in your accounting software before matching.').addClass('failure-text-AS')
                .end()
                .start().show(this.showMatchCurrency$)
                  .add('Please select an appropriate bank account in the same currency.').addClass('failure-text2')
                .end()
              .end()
            .end()
            .start().addClass('inline-bottom-div')
              .start(this.SAVE).end()
            .end()
          .end()
        .end();
    },
    function isXeroConnected() {
      if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
        this.xeroBtnLabel = this.DISCONNECT_LABEL;
        this.xeroConnected = this.CONNECTED_LABEL;
        this.bankMatchingLogo = '/images/xero.png';
        this.showXeroDisconected = true;
      } else {
        this.xeroBtnLabel = this.CONNECT_LABEL;
        this.xeroConnected = this.NOT_CONNECTED_LABEL;
        this.showXeroDisconected = false;
      }
      this.checkForConnections();
    },
    function isQuickbooksConnected() {
      if ( this.user.integrationCode == this.IntegrationCode.QUICKBOOKS  ) {
        this.qbBtnLabel = this.DISCONNECT_LABEL;
        this.qbConnected = this.CONNECTED_LABEL;
        this.bankMatchingLogo = '/images/quickbooks.png';
        this.showQuickBooksDisconected = true;
      } else {
        this.qbBtnLabel = this.CONNECT_LABEL;
        this.qbConnected = this.NOT_CONNECTED_LABEL;
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
        if ( this.xeroBtnLabel == this.DISCONNECT_LABEL ) {
          this.xeroService.removeToken(null, this.user).then(function(result) {
            self.xeroBtnLabel = this.CONNECT_LABEL;
            self.xeroConnected = this.NOT_CONNECTED_LABEL;
            self.notify('Xero integration has been disconnected.', '', self.LogLevel.INFO, true);
            self.connected = false;
            self.showXeroDisconected = false;
          })
          .catch(function(err) {
            self.notify(err.message, '', self.LogLevel.ERROR, true);
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
        if ( this.qbBtnLabel == this.DISCONNECT_LABEL ) {
          this.quickbooksService.removeToken(null, this.user).then(function(result) {
            self.qbBtnLabel = this.CONNECT_LABEL;
            self.qbConnected = this.NOT_CONNECTED_LABEL;
            self.notify('Intuit quickbooks integration has been disconnected.', '', self.LogLevel.INFO, true);
            self.connected = false;
            self.showQuickBooksDisconected = false;
          })
          .catch(function(err) {
            self.notify(err.message, '', self.LogLevel.ERROR, true);
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
        if ( this.accountingBankList == undefined || this.abliiBankList == undefined
            || this.accountingBankList == -1 || this.abliiBankList == -1 ) {
          this.showMatchCurrency = false;
          if ( this.abliiBankList == undefined || this.abliiBankList == -1 ) {
            this.showPickBankAblii = true;
          } else {
            this.showPickBankAblii = false;
          }
          if ( this.accountingBankList == undefined || this.accountingBankList == -1 ) {
            this.showPickBank = true;
          } else {
            this.showPickBank = false;
          }
          return;
        }
        this.showPickBank = false;
        this.showPickBankAblii = false;

        var abliiBank = await this.accountDAO.find(this.abliiBankList);
        let accountingBank = null;
        for ( let i = 0; i < this.accountingBankAccounts.bankAccountList.length; i++ ) {
          if ( this.accountingBankAccounts.bankAccountList[i].xeroBankAccountId === this.accountingBankList || 
               this.accountingBankAccounts.bankAccountList[i].quickBooksBankAccountId === this.accountingBankList) {
            accountingBank = this.accountingBankAccounts.bankAccountList[i];
            break;
          }
        }
        if ( ! accountingBank ) return;
        if ( ! ( abliiBank.denomination === accountingBank.currencyCode ) ) {
          this.showMatchCurrency = true;
          return;
        }
        this.showMatchCurrency = false;

        abliiBank.integrationId = accountingBank.xeroBankAccountId ? accountingBank.xeroBankAccountId: accountingBank.quickBooksBankAccountId;
        this.accountDAO.put(abliiBank).then(function(result) {
          self.notify('Accounts have been successfully linked.', '', self.LogLevel.INFO, true);
          self.accountingBankList = -1;
          self.abliiBankList = -1;
        });
      }
    }
  ]
});
