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
  package: 'net.nanopay.cico.ui.bankAccount',
  name: 'BankAccountsView',
  extends: 'foam.u2.Controller',

  documentation: 'View displaying list of Bank Accounts added.',

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'user',
    'stack',
    'accountDAO as bankAccountDAO'
  ],

  exports: [
    'selectedAccount',
    'verifyAccount'
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.bank.PKBankAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus'
  ],

  css: `
    ^ {
      width: 962px;
      margin: 0 auto;
    }
    ^ h3 {
      opacity: 0.6;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      display: inline-block;
      vertical-align: top;
      margin: 0;
      margin-top: 20px;
    }
    ^ .bankContentCard {
      width: 234px;
      height: 100px;
      margin-right: 13.5px;
      float: left;
    }
    ^ .actionButton {
      width: 218px;
      height: 100px;
      float: right;
      margin-bottom: 20px;
    }
    ^ .foam-u2-ActionView-create {
      visibility: hidden;
    }
    ^ .foam-u2-ActionView-addBank {
      margin: 0;
      background: none;
      outline: none;
      border: none;
      width: 218px;
      height: 100px;
      float: right;
      background-color: /*%PRIMARY3%*/ #406dea;
      letter-spacing: 0.3px;
      color: #FFFFFF;
      border-radius: 2px;
      opacity: 1;
      font-weight: normal;
    }
    ^ .foam-u2-ActionView-addBank span {
      display: block;
      margin-top: 8px;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
    }
    ^ .foam-u2-ActionView-addBank:hover {
      background: none;
      cursor: pointer;
      background-color: /*%PRIMARY3%*/ #406dea;
      opacity: 0.9;
    }
    ^ .foam-u2-dialog-Popup-inner {
      background-color: transparent !important;
    }
    ^ .foam-u2-md-OverlayDropdown {
      width: 175px;
    }
    ^ .foam-u2-PopupView {
      padding: 0 !important;
      z-index: 10000;
      width: 152px;
      background: white;
      opacity: 1;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
      position: absolute;
    }
    ^ .foam-u2-PopupView > div {
      height: 30px;
      text-align: left;
      padding-left: 29px;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
      line-height: 30px;
    }
    ^ .foam-u2-PopupView > div:hover {
      background-color: #59aadd;
      color: white;
      cursor: pointer;
    }
    ^ .foam-u2-PopupView::after {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 8px solid transparent;
      border-bottom-color: white;
      transform: translate(-24px, -106px);
    }
    ^ .foam-u2-view-TableView-row:hover {
      background: /*%GREY4%*/ #e7eaec;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
  `,

  properties: [
    'allBanksCount',
    'verifiedBanksCount',
    'unverifiedBanksCount',
    'disabledBanksCount',
    'selection',
    'selectedAccount',
    {
      name: 'data',
      factory: function() {
        var dao = this.bankAccountDAO
            .where(
              this.AND(
                this.EQ(this.BankAccount.OWNER, this.user.id),
                this.OR(
                  this.INSTANCE_OF(this.CABankAccount),
                  this.INSTANCE_OF(this.USBankAccount),
                  this.INSTANCE_OF(this.INBankAccount),
                  this.INSTANCE_OF(this.PKBankAccount))));
        dao.of = this.BankAccount;
        return dao;
      }
    }
  ],

  messages: [
    { name: 'TitleAll', message: 'Total Bank Accounts' },
    { name: 'TitleVerified', message: 'Verified Account(s)' },
    { name: 'TitleUnverified', message: 'Unverified Account(s)' },
    { name: 'TitleDisabled', message: 'Disabled Account(s)' },
    { name: 'ActionAdd', message: 'Add a new bank account' },
    { name: 'MyBlankAccounts', message: 'My Bank Accounts' },
    {
      name: 'placeholderText',
      message: 'You don\'t have any bank accounts right now. Click the Add a ' +
          'bank account button to add a new bank account.'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.data.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
        .start()
          .start()
            .tag({
              class: 'net.nanopay.ui.ContentCard',
              title: this.TitleAll,
              content$: this.allBanksCount$
            })
            .addClass('bankContentCard')
          .end()
          .start()
            .tag({
              class: 'net.nanopay.ui.ContentCard',
              title: this.TitleVerified,
              content$: this.verifiedBanksCount$
            })
            .addClass('bankContentCard')
          .end()
          .start()
            .tag({
              class: 'net.nanopay.ui.ContentCard',
              title: this.TitleUnverified,
              content$: this.unverifiedBanksCount$
            })
            .addClass('bankContentCard')
          .end()
          .start()
            .tag(this.ADD_BANK)
          .end()
        .end()
        .tag({
          class: 'foam.u2.ListCreateController',
          dao: this.data,
          factory: function() {
            // REVIEW: how to determine what type of bank account to create
            return self.BankAccount.create();
          },
          detailView: {},
          summaryView: this.BankAccountTableView
        })
        .tag({
          class: 'net.nanopay.ui.Placeholder',
          dao: this.data,
          message: this.placeholderText,
          image: 'images/ic-bankempty.svg'
        });
    },

    function verifyAccount() {
      this.stack.push({
        class: 'net.nanopay.cico.ui.bankAccount.AddBankView',
        wizardTitle: 'Verification',
        startAtValue: 2,
        nextLabelValue: 'Verify',
        backLabelValue: 'Come back later'
      }, this);
    }
  ],

  actions: [
    {
      name: 'addBank',
      label: 'Add a bank account',
      icon: 'images/ic-plus.svg',
      code: function() {
        this.stack.push({
          class: 'net.nanopay.bank.ui.BankPickCurrencyDropDownView',
          isCustomNavigation: true,
          hideBottomBar: true
        }, this);
      }
    }
  ],

  classes: [
    {
      name: 'BankAccountTableView',
      extends: 'foam.u2.View',

      requires: [
        'net.nanopay.bank.BankAccount',
        'net.nanopay.bank.BankAccountStatus',
        'foam.u2.dialog.Popup'
      ],

      imports: [
        'accountDAO as bankAccountDAO',
        'notify',
        'verifyAccount',
        'stack',
        'selectedAccount',
        'user'
      ],

      exports: [
        'manageAccountNotification'
      ],

      properties: [
        {
          name: 'selection',
          preSet: function(oldValue, newValue) {
            if (
                newValue &&
                newValue.status !== this.BankAccountStatus.DISABLED
            ) {
              this.selectedAccount = newValue;
              this.manageAccount();
              return oldValue;
            }
          }
        },
        {
          name: 'data',
          factory: function() {
            var dao = this.bankAccountDAO
                .where(
                  this.AND(
                    this.EQ(this.BankAccount.OWNER, this.user.id),
                    this.INSTANCE_OF(this.CABankAccount)));
            dao.of = this.BankAccount;
            return dao;
          }
        }
      ],

      messages: [
        { name: 'TitleVerification', message: 'Verification' }
      ],

      methods: [
        function initE() {
          this
            .start({
              class: 'foam.u2.view.ScrollTableView',
              data: this.data,
              selection$: this.selection$,
              columns: [
                'name', 'institution', 'accountNumber', 'status'
              ]
            })
              .addClass(this.myClass('table'))
            .end();
        },

        function manageAccount() {
          this.add(this.Popup.create().tag({
            class: 'net.nanopay.cico.ui.bankAccount.ManageAccountModal'
          }).addClass('manageAccounts'));
        },

        function manageAccountNotification(_message, _type) {
          this.notify(_message, '', _type, true);
        }
      ]
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        this.data.select(this.COUNT()).then(function(count) {
          self.allBanksCount = count.value;
        });

        var acctWithStatus = function(status) {
          return self.data.where(self.EQ(self.BankAccount.STATUS, status));
        };

        var verifiedBanksDAO = acctWithStatus(this.BankAccountStatus.VERIFIED);
        verifiedBanksDAO.select(this.COUNT()).then(function(count) {
          self.verifiedBanksCount = count.value;
        });

        var unverifiedBanksDAO =
            acctWithStatus(this.BankAccountStatus.UNVERIFIED);
        unverifiedBanksDAO.select(this.COUNT()).then(function(count) {
          self.unverifiedBanksCount = count.value;
        });

        var disabledBanksDAO = acctWithStatus(this.BankAccountStatus.DISABLED);
        disabledBanksDAO.select(this.COUNT()).then(function(count) {
          self.disabledBanksCount = count.value;
        });
      }
    }
  ]
});
