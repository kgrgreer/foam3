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
  package: 'net.nanopay.tx.ui',
  name: 'TransactionsAccountsView',
  extends: 'foam.u2.Controller',

   documentation: 'View displaying home page with list of accounts and transactions',

   implements: [
    'foam.mlang.Expressions'
  ],

   requires: [
    'foam.dao.FnSink',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.tx.model.Transaction',
    'foam.u2.view.ScrollTableView'
  ],

   imports: [
    'accountDAO',
    'balance',
    'balanceDAO',
    'currencyDAO',
    'currentAccount',
    'selection',
    'stack',
    'transactionDAO',
    'user',
    'userDAO'
  ],

   exports: [
    'transactions'
  ],

   css: `
    ^ {
      margin: 0 auto;
    }
    ^ .topContainer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        max-width: fit-content;
        margin: auto;
    }
    ^ .balanceBox {
      display: flex;
      align-items: center;
      position: relative;
      height: 100px;
      width: 360.5px;
      margin-top: 20px;
      margin-bottom: 20px;
      vertical-align: middle;
    }
    ^ .balanceBoxTitle {
      color: white;
      font-size: 14px;
      padding-bottom: 5px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .balance {
      font-size: 32px;
      font-weight: 900;
      line-height: 1;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .inlineDiv {
      display: inline-block;
      width: 135px;
      vertical-align: middle;
    }
    ^ .boxPadding {
      padding: 20px;
    }
    ^ .flexBox {
      display: flex;
      justify-content: center;
      flex-direction: row;
      width: fit-content;
    }
    ^ .transaction-status {
        color: #2cab70;
        width: 66px;
        border: 1px solid #2cab70;
        border-radius: 100px;
        padding-top: 3px;
        padding-bottom: 3px;
        padding-left: 7px;
        padding-right: 10px;
        text-align: center;
        margin: auto;
    }
    ^ .foam-u2-view-TreeView {
      margin-top: 15px;
      min-width: 300px;
    }
     ^ .foam-u2-view-TableView thead > tr > th {
      text-align: center;
      padding-left: 0px;
    }
     ^ table {
        table-layout: fixed;
        width: 1050px;
    }
     ^ table > tbody > tr {
      display: flex;
    }
      ^ .foam-u2-view-TableView tbody > tr {
      display: table-row;
    }
     ^ .foam-u2-view-TableView tbody > tr > td {
      text-align: center;
      padding-left: 0px;
    }
     ^ .foam-u2-view-TableView tbody > tr {
      height: 60px;
    }
    `,

   properties: [
    {
      name: 'selectedAccount'
    },
    {
      name: 'formattedBalance',
      value: '...'
    },
    {
      name: 'transactions',
      expression: function() {
        return foam.dao.MDAO.create({ of: this.Transaction });
      }
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
    function init() {
      this.document.body.scrollTop = 0;
    },
    function initE() {
      this.SUPER();
      this.selectedAccount$.sub(this.loadAccountInfo);
      this.transactionDAO
        .listen({ reset: this.onDAOUpdate, put: this.onDAOUpdate });
      this.onDAOUpdate();

      this
      .addClass(this.myClass());

      this
        .start('div').addClass('topContainer')
          .start('div').addClass('balanceBox')
            .start().addClass('boxPadding')
              .start().add(this.balanceTitle).addClass('balanceBoxTitle').end()
              .start().add(this.formattedBalance$).addClass('balance').end()
            .end()
          .end()
          .start().addClass('flexBox')
            .tag({
              class: 'foam.u2.view.TreeView',
              data: this.accountDAO.where(this.NOT(this.INSTANCE_OF(this.CABankAccount))),
              selection$: this.selectedAccount$,
              relationship: net.nanopay.account.AccountAccountChildrenRelationship,
              formatter: function(data) {
                this.add(data.name);
              }
            }).addClass('margin-treeView')
            .start(
              this.TxnTableView.create()
              )
            .end()
          .end()
      .end();
    },
    async function getTransactions(account) {
      if ( account ) {
        var allChildren = await this.getChildren(account);
        var childrenIds = allChildren.map((t)=> t.id);
        var predicate = this.OR(
          this.IN(this.Transaction.SOURCE_ACCOUNT, childrenIds),
          this.IN(this.Transaction.DESTINATION_ACCOUNT, childrenIds)
        );
        var predicate2 = this.NEQ(this.Transaction.TYPE, 'AlternaCITransaction');
        // update the DAO for TableView
        this.transactions = this.transactionDAO
          .where(this.AND(predicate2, predicate))
          .orderBy(this.DESC(this.Transaction.LAST_MODIFIED));
      }
    },
    async function getChildren(account) {
      var children = [account];
      if ( account.children ) {
        var accChildren = await account.children.select();
        for ( var acc of accChildren.array ) {
          var childChildren = await this.getChildren(acc);
          children = children.concat(childChildren);
        }
      }
      return children;
    }
  ],
  listeners: [
    async function loadAccountInfo() {
      if ( this.selectedAccount ) {
        this.getTransactions(this.selectedAccount); // not awaiting cause don't need to.
        var balance = await this.selectedAccount.findBalance(this.__context__);
        var currency = await this.currencyDAO
          .find(this.selectedAccount.denomination);
        this.formattedBalance = currency.format(balance);
      }
    },
    {
      name: 'onDAOUpdate',
      code: function onDAOUpdate() {
        var self = this;
        var account = this.selectedAccount === undefined ? this.currentAccount : this.selectedAccount;
        self.__subSubContext__.currencyDAO.find(account.denomination).then(function(curr) {
          account.findBalance(self.__subSubContext__).then(function(balance) {
            self.formattedBalance = curr.format(balance);
          });
        });
      }
    }
  ],
  classes: [
    {
      name: 'TxnTableView',
      extends: 'foam.u2.View',

       requires: [
        'net.nanopay.tx.model.Transaction'
      ],

       properties: [
        {
          name: 'currencyCache',
          factory: function() {
            return {};
          }
        },
        {
          name: 'accountsCache',
          factory: function() {
            return {};
          }
        }
      ],

       imports: [
        'accountDAO',
        'currencyDAO',
        'transactions'
      ],

       methods: [
        function initE() {
          var self = this;
          var Transaction = net.nanopay.tx.model.Transaction;
          this
            .start({
              class: 'foam.u2.view.ScrollTableView',
              data$: this.transactions$,
              columns: [
                foam.core.Property.create({
                  name: 'account',
                  label: 'From',
                  tableCellFormatter: function(value, obj, axiom) {
                    var account = self.accountsCache[obj.sourceAccount];
                    if ( account ) {
                      this.start().add(account.name)
                        .end();
                    } else {
                      self.accountDAO.find(obj.sourceAccount)
                        .then((acc) => {
                          self.accountsCache[obj.sourceAccount] = acc;
                          this.start().add(acc.name)
                            .end();
                        });
                    }
                  }
                }),
                Transaction.DESTINATION_ACCOUNT.clone().copyFrom({
                  label: 'To',
                  tableCellFormatter: function(value, obj, axiom) {
                    var account = self.accountsCache[obj.destinationAccount];
                    if ( account ) {
                      this.start().add(account.name)
                        .end();
                    } else {
                      self.accountDAO.find(obj.destinationAccount)
                        .then((acc) => {
                          self.accountsCache[obj.destinationAccount] = acc;
                          this.start().add(acc.name)
                            .end();
                        });
                    }
                  }
                }),
                Transaction.AMOUNT.clone().copyFrom({
                  label: 'Value',
                  tableCellFormatter: function(value, obj, axiom) {
                    var currency = self.currencyCache[obj.sourceCurrency];
                    if ( currency ) {
                      this.start().style({ 'float': 'right', 'padding-right': '12px' }).add(currency.format(obj.amount))
                        .end();
                    } else {
                      self.currencyDAO.find(obj.sourceCurrency).then((curr) => {
                        self.currencyCache[curr.id] = curr;
                        this.start().style({ 'float': 'right', 'padding-right': '12px' }).add(curr.format(obj.amount))
                          .end();
                      });
                    }
                  }
                }),
                net.nanopay.fx.FXTransaction.FX_RATE,
                'created',
                Transaction.STATUS.clone().copyFrom({
                  label: 'Status',
                  tableCellFormatter: function(value, obj, axiom) {
                    this.start()
                      .start().addClass('transaction-status').add(obj.status.label).end()
                    .end();
                  }
                }),
                 net.nanopay.tx.RetailTransaction.NOTES
              ]
            });
        }
      ]
    }
  ]
});
