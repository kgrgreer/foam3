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
  package: 'net.nanopay.admin.ui',
  name: 'TransactionView',
  extends: 'foam.u2.View',

  documentation: 'Transaction View',

  implements: [
    'foam.mlang.Expressions'
  ],

  exports: [ 'as data' ],

  imports: [
    'stack', 'transactionDAO'
  ],

  requires: [
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.Transaction'
  ],

  properties: [
    'selection',
    {
      name: 'data',
      factory: function() { return this.transactionDAO; }
    }
  ],

  css: `
    ^ p{
      display: inline-block;
    }

    ^pending-top-ups {
      opacity: 0.6;
      font-size: 24px;
      font-weight: 300 !important;
      line-height: 1.0;
      letter-spacing: 0.3px;
      color: /*%BLACK%*/ #1e1f21;
      padding-bottom: 30px;
    }

    ^container {
      width: 95%;
      position: relative;
      vertical-align: top;
      overflow: auto;
      z-index: 0;
      display: block;
      margin: auto;
      margin-top: 30px;
    }

    ^container th {
      background: black;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 16px;
      font-weight: normal;
      line-height: 1.0;
      letter-spacing: 0.3px;
      color: /*%BLACK%*/ #1e1f21;
      padding-left: 65px;
      text-align: left;
    }

    ^container td {
      width: 33%;
      padding-left: 65px;
      text-align: left;
      font-size: 14px;
    }

    .foam-u2-view-TableView-th-amount {
      text-align: left !important;
    }

    ^no-pending-transactions {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
      text-align: center;
      display: block;
      padding: 30px;
    }

    .profile-photo {
      width: 35px;
      height: 35px;
      vertical-align: middle;
      padding-right: 16px;
    }
  `,

  messages: [
    {
      name: 'noPendingTransactions',
      message: 'There is no transaction in your network yet'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var view = this;
      this
        .addClass(view.myClass())
        .tag({class: 'net.nanopay.admin.ui.shared.topNavigation.SubMenu', menuName: 'transactionSubMenu' })
        .start('div')
          .addClass(view.myClass('container'))
          .start('h1').addClass(view.myClass('pending-transactions')).add('Pending Top Ups').end()
          .tag(this.TransactionTableView)
          .start('span')
            .addClass(view.myClass('no-pending-transactions'))
            .add(view.slot(function(count) {
                return count.value == 0 ? view.noPendingTransactions : '';
              }, view.daoSlot(this.transactionDAO, this.COUNT())))
          .end()
        .end();
    }
  ],

  classes: [
    {
      name: 'TransactionTableView',
      extends: 'foam.u2.View',

      requires: [ 'net.nanopay.admin.model.Transaction' ],
      imports: [ 'transactionDAO' ],

      properties: [
        'selection',
        { name: 'data', factory: function() { return this.transactionDAO; }}
      ],

      methods: [
        function initE() {
          this.SUPER();

          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              data: this.data,
              columns: [
                'id', 'issueDate', 'payer', 'payee', 'total'
              ],
            }).end();
        }
      ]
    }
  ]
});
