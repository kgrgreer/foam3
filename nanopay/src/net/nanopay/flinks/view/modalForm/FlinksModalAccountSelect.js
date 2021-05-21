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
  package: 'net.nanopay.flinks.view.modalForm',
  name: 'FlinksModalAccountSelect',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Select from accounts returned from Flinks',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.payment.Institution',
    'foam.u2.LoadingSpinner'
  ],

  exports: [
    'as accountSelection'
  ],

  imports: [
    'flinksAuth',
    'institution',
    'institutionDAO',
    'isConnecting',
    'isSingleSelection',
    'notify',
    'user'
  ],

  css: `
    ^ {
      box-sizing: border-box;
      min-width: 615px;
      max-height: 80vh;
      overflow-y: auto;
    }
    ^content {
      position: relative;
      padding: 24px;
      padding-top: 0;
    }
    ^shrink {
      /*max height - titlebar - navigationbar - content padding*/
      max-height: calc(80vh - 77px - 88px - 24px);
      overflow: hidden;
    }
    ^account-card {
      width: auto;
      height: 83px;
      box-sizing: border-box;
      border-radius: 3px;
      box-shadow: 0 1px 1px 0 #dae1e9;
      border: 1px solid /*%GREY5%*/ #f5f7fa;

      margin-bottom: 16px;

      background-repeat: no-repeat;
      background-position-x: 24px;
      background-position-y: 34px;
      background-image: url(images/ablii/radio-resting.svg);

      cursor: pointer;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
    ^account-card:hover {
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
    }
    ^account-card:last-child {
      margin-bottom: 0;
    }
    ^account-card.selected {
      border: 1px solid #604aff;
      background-image: url(images/ablii/radio-active.svg);
    }
    ^account-info-container {
      display: flex;
      margin-left: 56px;
      height: 100%;
      flex-direction: row;
      align-items: center;
      padding-right: 24px;
    }
    ^account-info-container p {
      margin: 0;
    }
    ^title {
      font-size: 14px;
      font-weight: 900;
      padding-bottom: 4px;
    }
    ^subtitle {
      font-size: 10px;
      font-weight: normal;
      color: #8e9090;
    }
    ^balance {
      font-size: 14px;
      font-weight: 900;
      margin-left: auto !important;
    }
    ^instructions {
      font-size: 16px;
      line-height: 1.5;
      color: #8e9090;

      margin: 0;
      margin-bottom: 24px;
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
      class: 'Int',
      name: 'selectTick',
      value: - 1000000,
    },
    {
      class: 'Array',
      name: 'selectedAccounts',
      value: []
    }
  ],

  messages: [
    { name: 'Connecting', message: 'Almost there ...'},
    { name: 'INVALID_FORM', message: 'Please select an account to proceed'},
    { name: 'INSTRUCTIONS', message : 'Please select the account you wish to connect.'}
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .start({ class: 'net.nanopay.flinks.view.element.FlinksModalHeader', institution: this.institution }).end()
        .start().addClass(this.myClass('content'))
          .start().addClass('spinner-container').show(this.isConnecting$)
            .start().addClass('spinner-container-center')
              .add(this.loadingSpinner)
              .start('p').add(this.Connecting).addClass('spinner-text').end()
            .end()
          .end()
          .start().enableClass(this.myClass('shrink'), this.isConnecting$)
            .start('p').addClass(this.myClass('instructions')).add(this.INSTRUCTIONS).end()
            .forEach(this.viewData.accounts, function(account, index) {
              this.start().addClass(self.myClass('account-card'))
                .enableClass('selected', self.selectTick$.map((o) => self.isAccountSelected(account)))
                .start().addClass(self.myClass('account-info-container'))
                  .start().addClass(self.myClass('info-container'))
                    .start('p').addClass(self.myClass('title'))
                      .add(account.Title)
                    .end()
                    .start('p').addClass(self.myClass('subtitle'))
                      .add('Account # ' + account.AccountNumber)
                    .end()
                  .end()
                .end()
                .on('click', () => {
                  self.accountOnClick(account);
                  self.selectTick ++;
                })
              .end();
            })
          .end()
        .end()
        .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT}).end();
    },

    function isAccountSelected(account) {
      return !! this.selectedAccounts.find((t) => t === account);
    },

    function accountOnClick(account) {
      if ( this.isSingleSelection && this.selectedAccounts.length > 0 ) {
        // If we only allow single selections, remove the first one if there is one.
        this.selectedAccounts.splice(0, 1);
      }
      if ( this.isAccountSelected(account) ) {
        // deselect selection (Note: wont deselect if single selection since)
        this.selectedAccounts.splice(this.selectedAccounts.indexOf(account), 1);
      } else {
        this.selectedAccounts.push(account);
      }
    },

    async function crossCheckInstitutions() {
      this.isConnecting = true;
      var institutions = await this.institutionDAO.where(
        this.OR(
          this.EQ(this.Institution.NAME, this.institution.name),
          this.EQ(this.Institution.ABBREVIATION, this.institution.name),
        )
      ).select();
      var institution = institutions.array[0];
      for ( var account of this.selectedAccounts ) {
        var newAccount = this.createBankAccount( account, institution );
        this.viewData.bankAccounts ? this.viewData.bankAccounts.push(newAccount) : this.viewData.bankAccounts = [ newAccount ];
      }
      this.isConnecting = false;
      this.pushToId('pad');
    },

    function createBankAccount(account, institution) {
      return this.CABankAccount.create({
        name: institution.name,
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
      name: 'back',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'next',
      label: 'Confirm',
      code: function(X) {
        var self = this;
        var model = X.accountSelection;
        if ( model.isConnecting ) return;
        if ( model.selectedAccounts.length > 0 ) {
          model.crossCheckInstitutions();
          return;
        }
        X.notify(model.INVALID_FORM, '', self.LogLevel.ERROR, true);
      }
    }
  ]
});
