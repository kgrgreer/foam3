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
  name: 'TransactionsView',
  extends: 'foam.u2.view.AltView',

  documentation: 'View displaying home page with list of accounts and transactions',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.tx.model.Transaction',
    'foam.nanos.auth.User'
  ],

  imports: [
    'currentAccount',
    'transactionDAO',
    'userDAO',
    'user',
    'stack'
  ],

  exports: [
    'as data',
    'filter',
    'filteredTransactionDAO',
    'dblclick'
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
      margin: 0;
      display: inline-block;
      vertical-align: top;
      margin-bottom: 30px;
    }
    ^ .accountDiv {
      width: 400px;
      background-color: #ffffff;
      padding: 12px 10.4px 12px 10.4px;
      margin-bottom: 10px;
    }
    ^ .account {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: #59a5d5;
      text-decoration: underline;
      display: inline-block;
    }
    ^ .accountBalance {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      float: right;
      color: /*%BLACK%*/ #1e1f21;
      display: inline-block;
    }
    ^ .tableBarDiv {
      margin-top: 25px;
      margin-bottom: 10px;
    }
    ^ .interacLogo {
      width: 90px;
      height: 40px;
      display: inline-block;
      float: right;
      margin-right: 12px;
    }
    ^ .titleMargin {
      margin: 0;
    }
    ^ .searchIcon {
      position: absolute;
      margin-left: 5px;
      margin-top: 8px;
    }
    ^ .foam-u2-ActionView-sendTransfer {
      width: 135px;
      height: 40px;
      border-radius: 2px;
      background: #59a5d5;
      border: 0;
      box-shadow: none;
      display: inline-block;
      line-height: 40px;
      color: white;
      font-size: 14px;
      margin: 0;
      padding: 0;
      outline: none;
      float: right;
      cursor: pointer;
    }
    ^ .foam-u2-ActionView-sendTransfer:hover {
      background: #3783b3;
    }
    ^ table {
      border-collapse: collapse;
      margin: auto;
      width: 962px;
    }
    ^ thead > tr > th {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      background: white;
      color: /*%BLACK%*/ #1e1f21;
      line-height: 1.14;
      letter-spacing: 0.3px;
      border-spacing: 0;
      text-align: left;
      padding-left: 15px;
      height: 40px;
    }
    ^ tbody > tr > th > td {
      font-size: 12px;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      padding-left: 15px;
      height: 60px;
    }
    ^ .filter-search {
      width: 225px;
      height: 40px;
      border-radius: 2px;
      background-color: #ffffff;
      display: inline-block;
      margin-bottom: 30px;
      vertical-align: top;
      border: 0;
      box-shadow:none;
      padding: 10px 10px 10px 31px;
      font-size: 14px;
    }
    ^ .foam-u2-view-TableView-row:hover {
      cursor: pointer;
      background: /*%GREY4%*/ #e7eaec;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
    ^ .foam-u2-ActionView-create {
      visibility: hidden;
    }
    ^ .foam-u2-md-OverlayDropdown {
      width: 175px;
    }
    ^ .foam-u2-ActionView-exportButton {
      margin-right: 0;
    }
    ^ .foam-u2-ActionView-filterButton {
      position: absolute;
      width: 75px;
      height: 35px;
      opacity: 0.01;
      cursor: pointer;
      z-index: 100;
    }
    ^ .foam-u2-view-TreeView {
      display: block;
      overflow-x: auto;
    }
    ^ .foam-u2-view-TableView-net-nanopay-tx-model-Transaction {
      display: block;
      overflow-x: auto;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'filter',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Transaction ID, Name',
        onKey: true
      }
    },
    {
      name: 'data',
      factory: function() {
        return this.transactionDAO.where(
          this.OR(
            this.EQ(this.Transaction.SOURCE_ACCOUNT, this.currentAccount),
            this.EQ(this.Transaction.DESTINATION_ACCOUNT, this.currentAccount)
          ));
      }
    },
    {
      name: 'filteredTransactionDAO',
      expression: function(data, filter) {
        return data.where(
          this.OR(
            this.CONTAINS_IC(this.Transaction.ID, filter),
            this.CONTAINS_IC(this.Transaction.NAME, filter)
          )).orderBy(this.DESC(this.Transaction.CREATED));
      },
      view: {
        class: 'foam.u2.view.ScrollTableView',
        columns: [
          'id', 'name', 'created', 'payer', 'payee', 'total', 'status', 'type'
        ]
      }
    }
  ],

  messages: [
    { name: 'myAccounts', message: 'My Accounts' },
    { name: 'recentActivities', message: 'Recent Activities' },
    { name: 'placeholderText', message: 'You don\'t have any recent transactions right now.' }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .start().addClass('button-div')
              .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' }).addClass('searchIcon').end()
              .start(this.FILTER).addClass('filter-search').end()
              .tag(this.EXPORT_BUTTON)
            .end()
          .end()
        .end();
      this.SUPER();
    },

    function init() {
      this.views = [
        [{
          class: 'foam.u2.view.TableView',
          data$: this.filteredTransactionDAO$,
          columns: [
            'id', 'invoiceId', 'invoiceNumber', 'name', 'created', 'payer', 'payee', 'total', 'status', 'type'
          ] }, 'Table'
        ],
        [{
            class: 'foam.u2.view.TreeView',
            data: this.filteredTransactionDAO,
            relationship: net.nanopay.tx.model.TransactionTransactionChildrenRelationship,
            startExpanded: false,
            draggable: false,
            formatter: function(data) {
              this
                  .add('ID: ').add(data.id + '  , ')
                  .add('Name: ').add(data.name + '  , ')
                  .add('Created: ').add(data.created + '  , ')
                  .add('Amount: $').add(data.amount + '  , ')
                  .add('Status: ').add(data.status.name);
            }
          }, 'Tree'
        ]
      ];
    },
    function dblclick(transaction) {
      this.stack.push({ class: 'net.nanopay.admin.ui.TransactionDetailView', transaction: transaction });
    }
  ],

  actions: [
    {
      name: 'exportButton',
      label: 'Export',
      icon: 'images/ic-export.png',
      code: function(X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({ class: 'net.nanopay.ui.modal.ExportModal', exportData: X.filteredTransactionDAO }));
      }
    }
  ]
});
