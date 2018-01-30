foam.CLASS({
  package: 'net.nanopay.cico.ui',
  name: 'CicoView',
  extends: 'foam.u2.View',

  documentation: 'View for displaying all Cash In and Cash Out Transactions as well as account Balance',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.dao.FnSink',
    'foam.u2.dialog.Popup',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.cico.model.TransactionType',
    'net.nanopay.model.Account',
    'net.nanopay.model.BankAccount'
  ],

  imports: [
    'accountDAO',
    'account',
    'addCommas',
    'bankAccountDAO',
    'stack',
    'standardCICOTransactionDAO',
    'user',
    'auth'
  ],

  exports: [
    'amount',
    'bankList',
    'cashOut',
    'cashIn',
    'confirmCashOut',
    'confirmCashIn',
    'dblclick',
    'goToBankAccounts',
    'onCashOutSuccess',
    'onCashInSuccess',
    'resetCicoAmount',
    'as view'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 962px;
          margin: 0 auto;
        }
        ^ .balanceBox {
          position: relative;
          width: 330px;
          height: 100px;
          border-radius: 2px;
          background-color: #ffffff;
          box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.01);
          display: inline-block;
          vertical-align: top;
        }
        ^ .sideBar {
          width: 6px;
          height: 100px;
          background-color: %SECONDARYCOLOR%;
          float: left;
        }
        ^ .balanceBoxTitle {
          color: #093649;
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
          text-align: left;
          color: #093649;
          margin-top: 27px;
          margin-left: 44px;
        }
        ^ .inlineDiv {
          display: inline-block;
          width: 135px;
        }

        ^ .net-nanopay-ui-ActionView-cashInBtn {
          width: 135px;
          height: 50px;
          border-radius: 2px;
          background: %SECONDARYCOLOR%;
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
        ^ .net-nanopay-ui-ActionView-cashInBtn:hover {
          background: %SECONDARYCOLOR%;
          opacity: 0.9;
        }
        ^ .net-nanopay-ui-ActionView-cashOutButton {
          width: 135px;
          height: 50px;
          border-radius: 2px;
          background: rgba(164, 179, 184, 0.1);
          box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
          color: #093649;
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
        ^ .net-nanopay-ui-ActionView-cashOutButton:hover {
          background: lightgray;
        }
        ^ .recentActivities {
          opacity: 0.6;
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
          margin-top: 15px;
        }
        ^ .net-nanopay-ui-ActionView-create {
          visibility: hidden;
        }
        ^ .foam-u2-view-TableView-row:hover {
          cursor: pointer;
          background: %TABLEHOVERCOLOR%;
        }
        ^ .foam-u2-md-OverlayDropdown {
          width: 175px;
        }
        ^ thead > tr > th{
          background: %TABLECOLOR%;
        }

        ^ .loadingSpinner {
          position: absolute;
          top: 11px;
          left: 95px;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'Currency',
      name: 'amount'
    },
    {
      name: 'formattedBalance',
      value: 0
    },
    {
      class: 'Boolean',
      name: 'hasCashIn'
    },
    {
      name: 'userBankAccounts',
      factory: function() {
        return this.bankAccountDAO.where(this.EQ(this.BankAccount.OWNER, this.user.id));
      }
    },
    {
      name: 'bankList',
      view: function(_, X) {
        var self = X.view;
        return foam.u2.view.ChoiceView.create({
          dao: self.userBankAccounts.where(self.EQ(self.BankAccount.STATUS, 'Verified')),
          objToChoice: function(a){
            return [a.id, a.accountName];
          }
        })
      }
    },
    {
      name: 'cicoTransactions',
      expression: function(standardCICOTransactionDAO) {
        return standardCICOTransactionDAO.where(
          this.OR(
            this.EQ(this.Transaction.TYPE, this.TransactionType.CASHOUT),
            this.EQ(this.Transaction.TYPE, this.TransactionType.CASHIN)
          )
        );
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
      message: 'You don’t have any cash in or cash out transactions. Verify a bank account to proceed to cash in or cash out.'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.auth.check(null, "cico.ci").then(function(perm) {
        self.hasCashIn = perm;
      });

      this.accountDAO.find(this.user.id).then(function (a) {
        self.account.copyFrom(a);
        self.onDAOUpdate();
      });

      this.standardCICOTransactionDAO.listen(this.FnSink.create({fn:this.onDAOUpdate}));
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
        .start()
          .start('div').addClass('balanceBox')
            .start('div').addClass('sideBar').end()
            .start().add(this.balanceTitle).addClass('balanceBoxTitle').end()
            .start().add(this.formattedBalance$.map(function(b) {
              if ( self.isLoading ) return '...';
              return '$' + self.addCommas(b.toFixed(2).toString());
            })).addClass('balance').end()
          .end()
          .start('div').addClass('inlineDiv')
            .start().show(this.hasCashIn$).add(this.CASH_IN_BTN).end()
            .start().add(this.CASH_OUT_BUTTON).end()
          .end()
          .start()
            .tag({
              class: 'foam.u2.ListCreateController',
              dao: this.standardCICOTransactionDAO,
              factory: function() { return self.Transaction.create(); },
              detailView: {
              },
              summaryView: this.CicoTableView.create()
            })
          .end()
          .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.cicoTransactions, message: this.placeholderText, image: 'images/ic-bankempty.svg' })
        .end();
    },

    function dblclick(transaction) {
      this.stack.push({ class: 'net.nanopay.tx.ui.TransactionDetailView', data: transaction });
    },

    function cashIn() {
      this.add(this.Popup.create().tag({ class: 'net.nanopay.cico.ui.ci.CashInModal' }));
    },

    function confirmCashIn() {
      this.add(this.Popup.create().tag({ class: 'net.nanopay.cico.ui.ci.ConfirmCashInModal' }));
    },

    function onCashInSuccess() {
      this.add(this.Popup.create().tag({ class: 'net.nanopay.cico.ui.ci.CashInSuccessModal' }));
    },

    function cashOut() {
      this.add(this.Popup.create().tag({ class: 'net.nanopay.cico.ui.co.CashOutModal' }));
    },

    function confirmCashOut() {
      this.add(this.Popup.create().tag({ class: 'net.nanopay.cico.ui.co.ConfirmCashOutModal' }));
    },

    function onCashOutSuccess() {
      this.add(this.Popup.create().tag({ class: 'net.nanopay.cico.ui.co.CashOutSuccessModal' }));
    },

    function goToBankAccounts() {
      this.stack.push({ class: 'net.nanopay.cico.ui.bankAccount.BankAccountsView' });
    },

    function resetCicoAmount() {
      this.amount = 0;
    }
  ],

  actions: [
    {
      name : 'cashInBtn',
      label : 'Cash In',
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
      isMerged: true,
      code: function onDAOUpdate() {
        var self = this;
        self.isLoading = true;
        this.accountDAO.find(this.user.id).then(function (a) {
          self.account.copyFrom(a);
          self.formattedBalance = a.balance / 100;
        })
        .finally( function() {
          self.isLoading = false;
        });
      }
    }
  ],

  classes: [
    {
      name: 'CicoTableView',
      extends: 'foam.u2.View',
      implements: [
        'foam.mlang.Expressions',
      ],
      requires: [ 'net.nanopay.tx.model.Transaction',
                  'net.nanopay.cico.model.TransactionType'
                ],

      imports: [ 'standardCICOTransactionDAO' ],

      properties: [
        {
          name: 'cicoTransactions',
          expression: function(standardCICOTransactionDAO) {
            return standardCICOTransactionDAO.where(
              this.OR(
                this.EQ(this.Transaction.TYPE, this.TransactionType.CASHOUT),
                this.EQ(this.Transaction.TYPE, this.TransactionType.CASHIN)
              )
            );
          }
        }
      ],

      methods: [
        function initE() {
          this
            .start({
              class: 'foam.u2.view.TableView',
              editColumnsEnabled: true,
              data: this.cicoTransactions,
              columns: [
                'id', 'date', 'amount', 'type'
              ]
            });
        }
      ]
    }
  ]
});
