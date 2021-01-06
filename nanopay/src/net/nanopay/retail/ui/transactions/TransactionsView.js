foam.CLASS({
  package: 'net.nanopay.retail.ui.transactions',
  name: 'TransactionsView',
  extends: 'foam.u2.View',

  documentation: 'View displaying list of transactions by devices.',

  requires: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.RetailTransaction',
  ],

  imports: [ 'transactionDAO', 'stack' ],

  exports: [ 'setDevice' ],

  properties: [
    'deviceName',
    'totalBalance',
    'selection',
    { name: 'data', factory: function() { return this.transactionDAO; }}
  ],

  axioms: [
    foam.u2.CSS.create({
      code: `
        ^ {
          width: 100%;
          margin: auto;
          background-color: #EDF0F5;
        }

        ^ .container {
          width: 992px;
          margin: auto;
        }

        ^ .deviceBar {
          width: 100%;
          height: 40px;
          line-height: 40px;
          background-color: #FFFFFF;
          margin-bottom: 20px;
        }

        ^ .deviceBarContainer {
          width: 992px;
          margin: auto;
        }

        ^ .foam-u2-ActionView {
          opacity: 0.6;
          font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.3px;
          color: /*%BLACK%*/ #1e1f21;
          padding: 0;
          padding-left: 30px;
          display: inline-block;
          cursor: pointer;
          margin: 0;
          border: none;
          background: transparent;
          outline: none;
          line-height: 40px;
        }

        ^ .foam-u2-ActionView:first-child {
          padding-left: 0;
        }

        ^ .foam-u2-ActionView:hover {
          background: white;
          opacity: 1;
        }

        ^ .rowTopMarginOverride {
          margin-top: 56px !important;
        }

        ^ .deviceContentCard {
          width: 413px;
          height: 100px;
        }

        ^ .actionButton {
          width: 150px;
          height: 100px;
        }

        ^ .buttonFloat {
          float: right;
          margin-left: 5px;
        }

        ^ .actionSpacer {
          display: inline-block;
        }

        ^ .totalDiv {
          display: inline-block;
          float: right;
          margin-bottom: 20px;
        }

        ^ .foam-u2-ActionView-create {
          visibility: hidden;
        }

        ^ table {
          border-collapse: collapse;
          margin: auto;
          width: 992px;
        }

        ^ thead > tr > th {
          font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 14px;
          background-color: rgba(110, 174, 195, 0.2);
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

        ^ .foam-u2-view-TableView th {
          font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          padding-left: 15px;
          font-size: 14px;
          line-height: 1;
          letter-spacing: 0.4px;
          color: /*%BLACK%*/ #1e1f21;
          font-style: normal;
        }

        ^ .foam-u2-view-TableView td {
          font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          padding-left: 15px;
          font-size: 12px;
          color: /*%BLACK%*/ #1e1f21;
        }

        ^ tbody > tr {
          height: 60px;
          background: white;
        }

        ^ tbody > tr:nth-child(odd) {
          background: #f6f9f9;
        }
      `
    })
  ],

  messages: [
    { name: 'TitleDevice',    message: 'Device' },
    { name: 'TitleTotal',     message: 'Total' },
    { name: 'ActionCashOut',  message: 'Cash Out' },
    { name: 'FilterButtonTitle', message: 'Filters' },
    { name: 'RefundButtonTitle', message: 'Refund' },
    { name: 'PrintButtonTitle', message: 'Print' },
    { name: 'ExportButtonTitle', message: 'Export' }

  ],

  methods: [
    function initE() {
      var self = this;
      self.deviceName = "All";
      self.totalBalance = "$0.00";

      this
        .addClass(this.myClass())

        .start('div').addClass('container')
          .start('div').addClass('row')
            .tag({class: 'net.nanopay.retail.ui.devices.DeviceCTACard'})
          .end()
          .start('div').addClass('row')
            .tag({class: 'net.nanopay.cico.ui.bankAccount.BankCTACard'})
          .end()
        .end()

        .start('div').addClass('row')
          .start('div').addClass('deviceBar')
            .start('div').addClass('deviceBarContainer')
              .add(this.ALL)
              .add(this.INGENICO)
              .add(this.IPAD)
              .add(this.IPHONE)
              .add(this.ANDROID)
            .end()
          .end()
        .end()
        
        .start('div').addClass('container')
          .start('div').addClass('row')
            .start('div').addClass('spacer')
              .tag({class: 'net.nanopay.ui.ContentCard', title: this.TitleDevice, content$: this.deviceName$ }).addClass('deviceContentCard')
            .end()
            .start('div').addClass('totalDiv')
              .start('div').addClass('spacer')
                .tag({class: 'net.nanopay.ui.ContentCard', title: this.TitleTotal, content$: this.totalBalance$ }).addClass('deviceContentCard')
              .end()
              .start('div').addClass('actionSpacer')
                .tag({class: 'net.nanopay.ui.ActionButton', data: { text: this.ActionCashOut , image: 'ui/images/ic-cashout.svg'} }).addClass('actionButton')
                .on('click', function() { self.stack.push({ class: 'net.nanopay.retail.ui.cashout.CashOutView'})})
              .end()
            .end()
          .end()
          .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'ui/images/ic-filter.svg', text: this.FilterButtonTitle}})
          .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'ui/images/shape.svg', text: this.RefundButtonTitle}}).addClass('buttonFloat').end()
          .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'ui/images/ic-print.svg', text: this.PrintButtonTitle}}).addClass('buttonFloat').end()
          .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'ui/images/ic-export.svg', text: this.ExportButtonTitle}}).addClass('buttonFloat').end()
          .start()
            .tag({
                class: 'foam.u2.ListCreateController',
                dao: this.transactionDAO,
                factory: function() { return self.RetailTransaction.create(); },
                detailView: {
                  class: 'foam.u2.DetailView',
                  properties: [
                    this.Transaction.CREATED,
                    this.Transaction.PAYER,
                    this.Transaction.PAYEE,
                    this.RetailTransaction.TIP,
                    this.Transaction.TOTAL
                  ]
                },
              summaryView: this.TransactionsTableView.create()
            })
          .end()
        .end();
    },

    function setDevice(deviceName) {
      this.deviceName = deviceName;
    }
  ],

  actions: [
    {
      name: 'All',
      label: 'All',
      code: function(X) {
        X.setDevice('All');
      }
    },
    {
      name: 'Ingenico',
      label: 'Ingenico 1',
      code: function(X) {
        X.setDevice('Ingenico 1');
      }
    },
    {
      name: 'Ipad',
      label: 'iPad',
      code: function(X) {
        X.setDevice('iPad');
      }
    },
    {
      name: 'Iphone',
      label: 'iPhone',
      code: function(X) {
        X.setDevice('iPhone');
      }
    },
    {
      name: 'Android',
      label: 'Android',
      code: function(X) {
        X.setDevice('Android');
      }
    }
  ],

  classes: [
    {
      name: 'TransactionsTableView',
      extends: 'foam.u2.View',

      requires: [
        'net.nanopay.tx.model.Transaction',
        'net.nanopay.tx.RetailTransaction',
      ],

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
              data: this.data,
              columns: [
                'id', 'created', 'payer', 'payee', 'tip', 'total'
              ]
            }).addClass(this.myClass('table')).end();
        }
      ]
    }
  ]
});
