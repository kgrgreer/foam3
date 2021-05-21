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
  package: 'net.nanopay.accounting.ui',
  name: 'IntegrationPopUpView',
  extends: 'foam.u2.Controller',

  documentation: 'View to display bank matching for integrations',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO',
    'pushMenu',
    'notify',
    'quickbooksService',
    'user',
    'xeroService',
    'bankMatched',
    'theme'
  ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.accounting.IntegrationCode'
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
      color: /*%BLACK%*/ #1e1f21;
      margin-bottom: 8px;
    }
    ^ .foam-u2-tag-Select {
      width: 480px;
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
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .foam-u2-ActionView-save {
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
    ^ .foam-u2-ActionView-save:hover {
      background-color: #4d38e1 !important;
    }
    ^ .bank-matching{
      height: 40px;
    }
    ^ .foam-u2-ActionView-cancel {
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
    ^ .foam-u2-ActionView-cancel:hover {
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
    ^ .validation-failure-container {
      font-size: 10px;
      color: #d0021b;
      margin-bottom: 10px;
    }
    ^ .failure-text {
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
    ^ .error-box, foam-u2-tag-Select" {
      border-color: #f91c1c;
      background: #fff6f6;
    }
  `,

  messages: [
    { name: 'ACCOUNTING_BANKS_LABEL', message: 'Bank accounts in your accounting software' },
    { name: 'BANK_MATCHING_DESC_1', message: 'Please select which accounts you would like to match between ' },
    { name: 'BANK_MATCHING_DESC_2', message: ' from the drop downs.' },
    { name: 'BANK_MATCHING_DESC_3', message: 'This will ensure that all transactions completed on '},
    { name: 'BANK_MATCHING_DESC_4', message: ' are mapped and reconciled to the correct account in '},
    { name: 'BANK_MATCHING_DESC_5', message: 'Please select a bank account in your accounting software before matching.'},
    { name: 'BANK_MATCHING_DESC_6', message: 'Please select an appropriate bank account in the same currency.'},
    { name: 'BANK_MATCHING_TITLE', message: 'Bank account matching' },
    { name: 'TOKEN_EXPIRED', message: 'Your connection to the accounting software has expired. Please sync again.' },
    { name: 'AND', message: ' and ' },
    { name: 'YOUR', message: 'Your ' },
    { name: 'BANK_ACCOUNT', message: ' bank accounts ' },
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
    },
    {
      class: 'String',
      name: 'appName',
      factory: function() {
        return this.theme.appName;
      }
    }
  ],

  methods: [
    async function initE() {
      this.SUPER();

      this.isConnected();
      let bankAccountList = [];
      if ( this.user.integrationCode == this.IntegrationCode.QUICKBOOKS ) {
        this.accountingBankAccounts = await this.quickbooksService.bankAccountSync(null);
      } else if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
        this.accountingBankAccounts = await this.xeroService.bankAccountSync(null);
      }
      if ( ! this.accountingBankAccounts.result && this.accountingBankAccounts.errorCode.name === 'TOKEN_EXPIRED' ) {
        this.notify(this.TOKEN_EXPIRED, '', this.LogLevel.ERROR, true);
      } else if ( ! this.accountingBankAccounts.result && ! ( this.accountingBankAccounts.errorCode.name === 'NOT_SIGNED_IN' ) ) {
        this.notify(this.accountingBankAccounts.reason, '', this.LogLevel.ERROR, true);
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
        .addClass(this.myClass())
        .start().addClass('bank-matching-container')
          .start().addClass('bank-matching-box')
            .start().add(this.BANK_MATCHING_TITLE).addClass('title').end()
            .start({ class: 'foam.u2.tag.Image', data: '/images/ablii-wordmark.svg' }).addClass('ablii-logo').end()
            .start().add('+').addClass('plus-sign').end()
            .start({ class: 'foam.u2.tag.Image', data: this.bankMatchingLogo$ }).addClass('bank-matching').end()
            .start().add(this.BANK_MATCHING_DESC_1 + this.appName + this.AND + this.user.integrationCode.label + this.BANK_MATCHING_DESC_2).addClass('bank-matching-desc').end()
            .start().add(this.BANK_MATCHING_DESC_3 + this.appName + this.BANK_MATCHING_DESC_4 + this.user.integrationCode.label ).addClass('bank-matching-desc').addClass('marginTop').end()
            .start().add(this.YOUR + this.appName + this.BANK_ACCOUNT).addClass('drop-down-label').end()
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
                .add(this.BANK_MATCHING_DESC_5).addClass('failure-text')
              .end()
            .end()
            .start().add(this.ACCOUNTING_BANKS_LABEL).addClass('drop-down-label').end()
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
                  .add(this.BANK_MATCHING_DESC_5).addClass('failure-text')
                .end()
                .start().show(this.showMatchCurrency$)
                  .add(this.BANK_MATCHING_DESC_6).addClass('failure-text2')
                .end()
              .end()
            .end()
          .end()
          .start().addClass('bank-matching-action-box')
            .start(this.CANCEL).end()
            .start(this.SAVE).end()
          .end()
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
        var self = this;

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
          this.notify('Accounts have been successfully linked.', '', this.LogLevel.INFO, true);
          self.accountingBankList = -1;
          if ( ! self.isLandingPage ) {
            self.pushMenu('mainmenu.dashboard');
          }
        });
        this.bankMatched = true;
        X.closeDialog();
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
        this.bankMatched = false;
        X.closeDialog();
      }
    }
  ]
});
