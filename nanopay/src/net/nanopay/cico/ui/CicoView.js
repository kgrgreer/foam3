foam.CLASS({
  package: 'net.nanopay.cico.ui',
  name: 'CicoView',
  extends: 'foam.u2.View',

  documentation: 'View for displaying all Cash In and Cash Out Transactions as well as account Balance',

  requires: [
    'foam.dao.FnSink',
    'foam.u2.dialog.Popup',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.model.Account'
  ],

  imports: [
    'accountDAO',
    'account',
    'bankAccountDAO',
    'stack',
    'standardCICOTransactionDAO',
    'user'
  ],

  exports: [
    'amount',
    'bankList',
    'cashOut',
    'cashIn',
    'confirmCashOut',
    'confirmCashIn',
    'goToBankAccounts',
    'onCashOutSuccess',
    'onCashInSuccess'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 962px;
          margin: 0 auto;
        }
        ^ .balanceBox {
          width: 330px;
          height: 100px;
          border-radius: 2px;
          background-color: #ffffff;
          box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.01);
          display: inline-block;
          vertical-align: top;
        }
        ^ .greenBar {
          width: 6px;
          height: 100px;
          background-color: #23c2b7;
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
          background: #59a5d5;
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
          background: #3783b3;
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
        ^ .foam-u2-view-TableView-noselect {
          width: 1px;
          cursor: pointer;
        }
        ^ .foam-u2-md-OverlayDropdown {
          width: 175px;
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
      name: 'formattedBalance'
    },
    {
      name: 'bankList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.bankAccountDAO,
          objToChoice: function(a){
            return [a.id, a.accountName];
          }
        })
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;
      this.standardCICOTransactionDAO.listen(this.FnSink.create({fn:this.onDAOUpdate}));

      this.formattedBalance = this.account.balance/100;

      this
        .addClass(this.myClass())
        .start()
          .start('div').addClass('balanceBox')
            .start('div').addClass('greenBar').end()
            .start().add(this.balanceTitle).addClass('balanceBoxTitle').end()
            .start().add('$', this.formattedBalance$.map(function(b) { return b.toFixed(2); })).addClass('balance').end()
          .end()
          .start('div').addClass('inlineDiv')
            .add(this.CASH_IN_BTN)
            .add(this.CASH_OUT_BUTTON)
          .end()
          .start().add(this.recentActivities).addClass('recentActivities').end()
          .start()
            .tag({
              class: 'foam.u2.ListCreateController',
              dao: this.standardCICOTransactionDAO,
              factory: function() { return self.Transaction.create(); },
              detailView: {
                class: 'foam.u2.DetailView',
                properties: [
                  this.Transaction.DATE,
                  this.Transaction.ID,
                  this.Transaction.AMOUNT,
                  this.Transaction.TYPE
                ]
              },
              summaryView: this.CicoTableView.create()
            })
          .end()
        .end();
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
    }
  ],

  messages: [
    { name: 'balanceTitle', message: 'Balance' },
    { name: 'recentActivities', message: 'Recent Activities'}
  ],

  actions: [
    {
      name : 'cashInBtn',
      label : 'Cash In',
      code: function(X) {
        X.cashIn();
      }
    },
    {
      name: 'cashOutButton',
      label: 'Cash Out',
      code: function(X) {
        X.cashOut();
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
        'selection',
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
              selection$: this.selection$,
              editColumnsEnabled: true,
              data: this.cicoTransactions,
              columns: [
                'date', 'id', 'amount', 'type'
              ]
            }).addClass(this.myClass('table')).end();
        }
      ]
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isMerged: true,
      code: function onDAOUpdate() {
        var self = this;
        this.accountDAO.find(this.account.id).then(function(account) {
          self.account = account;
          self.formattedBalance = account.balance/100;
        });
      }
    }
  ]
});