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
  package: 'net.nanopay.interac.ui',
  name: 'IndiaTransactionsView',
  extends: 'foam.u2.View',

  documentation: 'View displaying interac home page with list of accounts and transactions',

  requires: [ 'net.nanopay.tx.model.Transaction' ],

  imports: [
    'transactionDAO',
    'account',
    'user'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: `
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
          color: #093649;
          margin-bottom: 20px;
          display: inline-block;
          vertical-align: top;
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
          color: #093649;
          display: inline-block;
        }
        ^ .tableBarDiv {
          margin-top: 25px;
          margin-bottom: 10px;
        }
        ^ .impsLogo {
          width: 90px;
          height: 40px;
          display: inline-block;
          float: right;
          margin-right: 12px;
        }
        ^ .titleMargin {
          margin: 0;
        }
        ^ .foam-u2-ActionView-sendTransfer {

          width: 135px;
          height: 40px;
          border-radius: 2px;
          background: #e68e43;
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
          background: #CD752A;
        }
        ^ table {
          border-collapse: collapse;
          margin: auto;
          width: 962px;
        }
        ^ thead > tr > th {
          font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 14px;
          background-color: rgba(110, 174, 195, 0.2);
          color: #093649;
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
          color: #093649;
          padding-left: 15px;
          height: 60px;
        }
        ^ .foam-u2-view-TableView th {
          font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          padding-left: 15px;
          font-size: 14px;
          line-height: 1;
          letter-spacing: 0.4px;
          color: #093649;
        }
        ^ .foam-u2-view-TableView td {
          font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          padding-left: 15px;
          font-size: 12px;
          color: #093649;
        }
        ^ tbody > tr {
          height: 60px;
          background: white;
        }
        ^ tbody > tr:nth-child(odd) {
          background: #f6f9f9;
        }
        ^ .foam-u2-ActionView-create {
          visibility: hidden;
        }
        ^ .foam-u2-md-OverlayDropdown {
          width: 175px;
        }
      `
    })
  ],

  properties: [
    { name: 'data', factory: function() { return this.transactionDAO; }}
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start('h3').add(this.myAccounts).end()
          .start('div').addClass('accountDiv')
            .start().add('Chequing Account xxxxxxxxxxxx0933').addClass('account').end()
            .start().add('INR ', this.account$.dot('balance').map(function(b){return (b/100).toFixed(2); })).addClass('accountBalance').end()
          .end()
          .start('div').addClass('tableBarDiv')
            .start('h3').add(this.recentActivities).addClass('titleMargin').end()
            .add(this.SEND_TRANSFER)
            .start({class: 'foam.u2.tag.Image', data: 'images/imps.jpg'})
              .addClass('impsLogo')
            .end()
          .end()
          .start()
            .add(this.user$.dot('id').map(function (id) {
              return id == 1 ?
                self.E().tag({
                    class: 'foam.u2.ListCreateController',
                    dao: self.transactionDAO,
                    factory: function() { return self.Transaction.create(); },
                    detailView: {
                      class: 'foam.u2.DetailView',
                      properties: [
                        self.Transaction.IMPS_REFERENCE_NUMBER,
                        self.Transaction.DATE,
                        self.Transaction.PAYEE_ID,
                        self.Transaction.AMOUNT,
                        self.Transaction.RECEIVING_AMOUNT,
                        self.Transaction.RATE,
                        self.Transaction.FEES
                      ]
                    },
                  summaryView: self.TransactionTableView.create()
                }) :
                self.E().tag({
                    class: 'foam.u2.ListCreateController',
                    dao: self.transactionDAO,
                    factory: function() { return self.Transaction.create(); },
                    detailView: {
                      class: 'foam.u2.DetailView',
                      properties: [
                        self.Transaction.IMPS_REFERENCE_NUMBER,
                        self.Transaction.DATE,
                        self.Transaction.PAYER_ID,
                        self.Transaction.AMOUNT,
                        self.Transaction.RECEIVING_AMOUNT,
                        self.Transaction.RATE,
                        self.Transaction.FEES
                      ]
                    },
                  summaryView: self.TransactionIndiaTableView.create()
                });
            }))
          .end()
        .end();
    }
  ],

  messages: [
    { name: 'myAccounts', message: 'My Accounts' },
    { name: 'recentActivities', message: 'Recent Activities' }
  ],

  actions: [
    {
      name: 'sendTransfer',
      label: 'Send e-Transfer',
      code: function(X) {
        // send e-Transfer functionality
        X.stack.push({ class: 'net.nanopay.interac.ui.etransfer.TransferWizard' })
      }
    }
  ],

  classes: [
    {
      name: 'TransactionTableView',
      extends: 'foam.u2.View',

      requires: [ 'net.nanopay.tx.model.Transaction' ],

      imports: [ 'transactionDAO' ],

      properties: [
        'selection',
        { name: 'data', factory: function() {return this.transactionDAO}}
      ],

      methods: [
        function initE() {
          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              editColumnsEnabled: true,
              data: this.data,
              columns: [
                'impsReferenceNumber', 'date', 'payeeId', 'amount', 'receivingAmount', 'rate', 'fees'
              ]
            }).addClass(this.myClass('table')).end();
        }
      ]
    },

    {
      name: 'TransactionIndiaTableView',
      extends: 'foam.u2.View',

      requires: [ 'net.nanopay.tx.model.Transaction' ],

      imports: [ 'transactionDAO' ],

      properties: [
        'selection',
        { name: 'data', factory: function() {return this.transactionDAO}}
      ],

      methods: [
        function initE() {
          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              editColumnsEnabled: true,
              data: this.data,
              columns: [
                'impsReferenceNumber', 'date', 'sourceAccount', 'amount', 'receivingAmount', 'rate', 'fees'
              ]
            }).addClass(this.myClass('table')).end();
        }
      ]
    }
  ]
});
