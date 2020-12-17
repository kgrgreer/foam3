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
  package: 'net.nanopay.cico.ui',
  name: 'CicoView',
  extends: 'foam.u2.View',

  documentation: 'View for displaying all Cash In and Cash Out Transactions as well as account Balance',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.tx.cico.CITransaction',
    'foam.dao.FnSink',
    'foam.u2.dialog.Popup',
    'net.nanopay.account.Balance',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  imports: [
    // TODO: remove/replace
    'balanceDAO',
    'currencyDAO',
    'currentAccount',
    'balance',
    'accountDAO as bankAccountDAO',
    'findAccount',
    'stack',
    'transactionDAO',
    'user',
    'auth',
    'window',
    'findBalance'
  ],

  exports: [
    'amount',
    'bankList',
    'cashOut',
    'cashIn',
    'cicoTransactions',
    'confirmCashOut',
    'confirmCashIn',
    'dblclick',
    'goToBankAccounts',
    'onCashOutSuccess',
    'onCashInSuccess',
    'resetCicoAmount',
    'as view'
  ],

  css: `
    ^ {
      width: 962px;
      margin: 0 auto;
    }
    ^ .topContainer {
      width: 100%;
    }
    ^ .balanceBox {
      position: relative;
      min-width: 330px;
      max-width: calc(100% - 135px);
      padding-bottom: 15px;
      border-radius: 2px;
      background-color: #ffffff;
      box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.01);
      display: inline-block;
      vertical-align: middle;
    }
    ^ .sideBar {
      width: 6px;
      height: 100%;
      background-color: /*%PRIMARY3%*/ #406dea;
      position: absolute;
    }
    ^ .balanceBoxTitle {
      color: /*%BLACK%*/ #1e1f21;
      font-size: 12px;
      margin-left: 44px;
      padding-top: 14px;
      line-height: 1.33;
      letter-spacing: 0.2px;
    }
    ^ .balance {
      font-size: 30px;
      font-weight: 300;
      line-height: 1;
      letter-spacing: 0.5px;
      overflow-wrap: break-word;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 27px;
      margin-left: 44px;
      margin-right: 44px;
    }
    ^ .inlineDiv {
      display: inline-block;
      width: 135px;
      vertical-align: middle;
    }

    ^ .foam-u2-ActionView-cashInBtn {
      width: 135px;
      height: 50px;
      border-radius: 2px;
      background: /*%PRIMARY3%*/ #406dea;
      color: white;
      margin: 0;
      padding: 0;
      border: 0;
      outline: none;
      cursor: pointer;
      line-height: 50px;
      font-size: 14px;
      font-weight: normal;
      box-shadow: none;
    }
    ^ .foam-u2-ActionView-cashInBtn:hover {
      background: /*%PRIMARY3%*/ #406dea;
      opacity: 0.9;
    }
    ^ .foam-u2-ActionView-cashOutButton {
      width: 135px;
      height: 50px;
      border-radius: 2px;
      background: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      color: /*%BLACK%*/ #1e1f21;
      margin: 0;
      padding: 0;
      border: 0;
      outline: none;
      cursor: pointer;
      line-height: 50px;
      font-size: 14px;
      font-weight: normal;
      margin-bottom: 2px;
    }
    ^ .foam-u2-ActionView-cashOutButton:hover {
      background: lightgray;
    }
    ^ .recentActivities {
      opacity: 0.6;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 15px;
    }
    ^ .foam-u2-ActionView-create {
      visibility: hidden;
    }
    ^ .foam-u2-md-OverlayDropdown {
      width: 175px;
    }
    ^ .loadingSpinner {
      position: absolute;
      top: 11px;
      left: 95px;
    }
    ^ .foam-u2-view-TableView-row:hover {
      background: /*%GREY4%*/ #e7eaec;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
  `,

  properties: [
    {
      class: 'UnitValue',
      name: 'amount'
    },
    {
      name: 'formattedBalance',
      value: '...'
    },
    {
      class: 'Boolean',
      name: 'hasCashIn'
    },
    {
      name: 'userBankAccounts',
      factory: function() {
        return this.bankAccountDAO.where(
          this.AND(
            this.EQ(this.BankAccount.OWNER, this.user.id),
            this.EQ(this.BankAccount.STATUS, this.BankAccountStatus.VERIFIED)
          )
        );
      }
    },
    {
      name: 'bankList',
      view: function(_, X) {
        var self = X.view;
        return foam.u2.view.ChoiceView.create({
          dao: self.userBankAccounts,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      }
    },
    {
      name: 'cicoTransactions',
      expression: function(transactionDAO, currentAccount) {
        return transactionDAO.where(this.OR(
          this.EQ(this.Transaction.SOURCE_ACCOUNT, currentAccount),
          this.EQ(this.Transaction.DESTINATION_ACCOUNT, currentAccount)
        ));
      }
    },
    {
      class: 'Boolean',
      name: 'isLoading',
      value: true
    }
  ],

  messages: [
    { name: 'balanceTitle', message: 'Balance' },
    {
      name: 'placeholderText',
      message: 'You don’t have any cash in or cash out transactions. Verify ' +
          'a bank account to proceed to cash in or cash out.'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.getDefaultBank();

      this.auth.check(null, 'cico.ci').then(function(perm) {
        self.hasCashIn = perm;
      });

      this.transactionDAO.listen(this.FnSink.create({ fn: this.onDAOUpdate }));
      this.onDAOUpdate();
      this.currentAccount$.sub(this.onDAOUpdate);

      this
        .addClass(this.myClass())
        .start()
          .start('div').addClass('topContainer')
            .start('div').addClass('balanceBox')
              .start('div').addClass('sideBar').end()
              .start().add(this.balanceTitle).addClass('balanceBoxTitle').end()
              .start().add(this.formattedBalance$).addClass('balance').end()
            .end()
            .start('div').addClass('inlineDiv')
              .start().show(this.hasCashIn$).add(this.CASH_IN_BTN).end()
              .start().add(this.CASH_OUT_BUTTON).end()
            .end()
          .end()
          .start()
            .tag({
              class: 'foam.u2.ListCreateController',
              dao: this.transactionDAO,
              factory: function() {
                return self.Transaction.create();
              },
              detailView: {
              },
              summaryView: this.CicoTableView.create()
            })
          .end()
          .tag({
            class: 'net.nanopay.ui.Placeholder',
            dao: this.cicoTransactions,
            message: this.placeholderText,
            image: 'images/ic-bankempty.svg'
          })
        .end();
    },

    function dblclick(transaction) {
      this.stack.push({
        class: 'net.nanopay.tx.ui.TransactionDetailView',
        data: transaction
      });
    },

    function cashIn() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.cico.ui.ci.CashInModal'
      }));
    },

    function confirmCashIn() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.cico.ui.ci.ConfirmCashInModal'
      }));
    },

    function onCashInSuccess() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.cico.ui.ci.CashInSuccessModal'
      }));
    },

    function cashOut() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.cico.ui.co.CashOutModal'
      }));
    },

    function confirmCashOut() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.cico.ui.co.ConfirmCashOutModal'
      }));
    },

    function onCashOutSuccess() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.cico.ui.co.CashOutSuccessModal'
      }));
    },

    function goToBankAccounts() {
      this.stack.push({
        class: 'net.nanopay.cico.ui.bankAccount.BankAccountsView'
      });
      this.window.location.hash = 'set-bank';
    },

    function resetCicoAmount() {
      this.amount = 0;
    },

    function getDefaultBank() {
      var self = this;
      self.userBankAccounts
          .where(self.EQ(self.BankAccount.IS_DEFAULT, true))
          .select()
          .then(function(result) {
            if ( result.array.length == 0 ) return;
            self.bankList = result.array[0].id;
          });
    }
  ],

  actions: [
    {
      name: 'cashInBtn',
      label: 'Cash In',
      code: function(X) {
        X.resetCicoAmount();
        X.cashIn();
      }
    },
    {
      name: 'cashOutButton',
      label: 'Cash Out',
      code: function(X) {
        X.resetCicoAmount();
        X.cashOut();
      }
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      // isMerged: true,
      code: function onDAOUpdate() {
        this.balanceDAO.find(this.currentAccount.id).then((balance) => {
          var amount = 0;

          if ( balance != null ) {
            this.balance.copyFrom(balance);
            amount = this.balance.balance;
          }

          this.currencyDAO
            .find(this.currentAccount.denomination)
            .then((currency) => {
              this.formattedBalance = currency.format(amount);
            });
        });
      }
    }
  ],

  classes: [
    {
      name: 'CicoTableView',
      extends: 'foam.u2.View',

      requires: [
        'net.nanopay.tx.model.Transaction'
      ],

      imports: [
        'cicoTransactions',
        'transactionDAO'
      ],

      methods: [
        function initE() {
          this
            .start({
              class: 'foam.u2.view.ScrollTableView',
              data$: this.cicoTransactions$,
              columns: [
                'id', 'created', 'amount', 'name', 'status'
              ]
            });
        }
      ]
    }
  ]
});
