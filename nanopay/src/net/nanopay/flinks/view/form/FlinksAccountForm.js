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
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksAccountForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',
  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'form',
    'institutionDAO',
    'isConnecting',
    'loadingSpinner',
    'pushViews',
    'user'
  ],

  requires: [
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.payment.Institution'
  ],

  css: `
    ^ {
      width: 497px;
    }
    ^ .accountView {
      width: 100%;
      height: 190px;
      overflow:auto;
    }
    ^ .spacer {
      margin-bottom: 10px;
    }
    ^ .spacer:last-child {
      margin-bottom: 0px;
    }
    ^ .subContent {
      width: 495px;
      height: 285px;
    }
    ^ .account {
      cursor: pointer;
    }
    ^ .account:hover{
      border: solid 1px /*%PRIMARY5%*/ #e5f1fc;
    }
    ^ .account.selected {
      border: solid 3px #1cc2b7;
    }
    ^ .account.selected.net-nanopay-flinks-view-element-AccountCard {
      padding: 0 38px;
    }
    ^ .Nav {
      margin-top: 20px;
      width: 497px;
    }
    ^ .foam-u2-ActionView-addAccount {
      margin-left: 361px;
      width: 136px;
      height: 40px;
      background-color: #59a5d5;
      color: #ffffff;
    }
    ^ .foam-u2-ActionView-nextButton {
      float: right;
      margin: 0;
      box-sizing: border-box;
      background-color: #59a5d5;
      outline: none;
      border:none;
      width: 136px;
      height: 40px;
      border-radius: 2px;
      font-size: 12px;
      font-weight: lighter;
      letter-spacing: 0.2px;
      color: #FFFFFF;
    }
    ^ .foam-u2-ActionView-closeButton:hover:enabled {
      cursor: pointer;
    }
    ^ .foam-u2-ActionView-closeButton {
      float: left;
      margin: 0;
      outline: none;
      min-width: 136px;
      height: 40px;
      border-radius: 2px;
      // background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      font-size: 12px;
      font-weight: lighter;
      letter-spacing: 0.2px;
      margin-right: 40px;
      margin-left: 1px;
    }
    ^ .foam-u2-ActionView-nextButton:disabled {
      background-color: #7F8C8D;
    }
    ^ .foam-u2-ActionView-nextButton:hover:enabled {
      cursor: pointer;
    }
  `,

  messages: [
    { name: 'Step', message: 'Step 4: Please choose the account you want to connect with nanopay.' }
  ],

  properties: [
    {
      class: 'Int',
      name: 'selectTick',
      value: - 1000000,
    },
    {
      class: 'Array',
      name: 'selectedAccounts',
      value: []
    },
    {
      class: 'Array',
      name: 'filteredValidAccounts',
      factory: function() {
        return this.viewData.accounts
          .filter((t) => this.isValidAccount(t));
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
    },

    function initE() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())
        .start('div').addClass('subTitleFlinks')
          .add(this.Step)
        .end()
        .start('div').addClass('subContent')
          .tag({
            class: 'net.nanopay.flinks.view.form.FlinksSubHeader',
            secondImg: this.viewData.selectedInstitution.image
          })
          .start('div').addClass('accountView')
            .forEach(this.filteredValidAccounts, function(account, index) {
              this.start({
                class: 'net.nanopay.flinks.view.element.AccountCard',
                name: account.Title,
                accountNo: account.AccountNumber,
                balance: account.Balance.Current
              }).style({ 'margin-left': '20px' })
                .addClass('spacer')
                .addClass('account')
                .enableClass('selected',
                  self.selectTick$.map((o) => self.isAccountSelected(account)))
                .on('click', () => {
                  self.accountOnClick(account);
                  self.selectTick ++;
                })
              .end();
            })
          .end()
        .end()
        .start('div').style({ 'margin-top': '15px', 'height': '40px' })
          .tag(this.NEXT_BUTTON)
          .tag(this.CLOSE_BUTTON)
        .end()
        .start('div').style({ 'clear': 'both' }).end();
    },
    function isValidAccount(account) {
      var hasTransitNumber = account.TransitNumber && account.TransitNumber !== '';
      var isCAD = account.Currency === 'CAD';
      return hasTransitNumber && isCAD;
    },
    function isAccountSelected(account) {
      return !! this.selectedAccounts.find((t) => t === account);
    },
    function accountOnClick(account) {
      if ( this.isAccountSelected(account) ) {
        this.selectedAccounts
          .splice(this.selectedAccounts.indexOf(account), 1);
      } else {
        this.selectedAccounts.push(account);
      }
    },
    async function createBankAccounts() {
      this.isConnecting = true;
      this.loadingSpinner.show();

      var institutions = await this.institutionDAO.where(
        this.EQ(this.Institution.NAME, this.viewData.selectedInstitution.name)
      ).select();
      var institution = institutions.array[0];
      for ( var account of this.selectedAccounts ) {
        var newAccount = this.createBankAccount(
          account, institution
        );
        this.viewData.bankAccounts.push(newAccount);
      }
      this.isConnecting = false;
      this.loadingSpinner.hide();
      // go to PADScreen
      this.pushViews('PADAuthorizationForm');
    },
    function createBankAccount(account, institution) {
      return this.CABankAccount.create({
        name: account.Title,
        accountNumber: account.AccountNumber,
        institution: institution,
        institutionNumber: institution.institutionNumber,
        branchId: account.TransitNumber, // setting branchId cause branch maybe present or not(the lookup is done on the BE).
        status: this.BankAccountStatus.VERIFIED,
        owner: this.user.id
      });
    }
  ],

  actions: [
    {
      name: 'nextButton',
      label: 'Add Account',
      isEnabled: function(selectTick, isConnecting, selectedAccounts) {
        return ! isConnecting && selectedAccounts.length !== 0;
      },
      code: function(X) {
        this.isConnecting = true;
        this.createBankAccounts();
      }
    },
    {
      name: 'closeButton',
      label: 'Cancel',
      code: function(X) {
        X.form.stack.back();
      }
    }
  ]
});
