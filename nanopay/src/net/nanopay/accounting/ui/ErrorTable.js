foam.CLASS({
  package: 'net.nanopay.accounting.ui',
  name: 'ErrorTable',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO',
    'pushMenu',
    'quickbooksService',
    'stack',
    'user',
    'xeroService',
    'salesDAO'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.accounting.IntegrationCode'
  ],

  css: `
  .error-table-container .foam-u2-view-TableView-vertDots {
    background-color: aqua !important;
    display: none;
  }
  
  .error-table-title {
    height: 48px;
    background-color: #ffffff;
    padding-left: 8%;
    line-height: 48px;
    text-align: initial;
    border: solid 1px #e2e2e3;
    box-shadow: 0 1px 1px 0 #dae1e9;
  }
  
  .error-table-title:hover {
    cursor: pointer;
  }
  
  .error-table-container .foam-u2-view-TableView thead > tr > th {
    text-align: center;
  }
  
  .error-table-container {
    height: 300px;
    overflow-x: hidden;
    overflow-y: scroll;
  }
  
  .error-table-container .foam-u2-view-TableView {
    width: 677px !important;
  }
  
  .error-table-container .foam-u2-view-TableView tbody > tr {
    text-align: center;
    background-color: #f9fbff;
  }
  
  `,

  messages: [
    { name: 'SuccessMessage', message: 'Successfully synced contacts and invoices' },
  ],

  properties: [
    'invoiceResult',
    'contactResult',
    'columns',
    {
      type: 'String',
      name: 'header'
    },
    {
      name: 'data',
    },
    {
      name: 'open',
      type: 'Boolean',
      value: false
    }
  ],

  methods: [
    function initE() {

      this
        .start()
        .start('div').addClass('error-table-container')

          .start('div').addClass('error-table-title').on('click', this.toggle)
            .add(this.header)
          .end()

        .start().show(this.open$)
          .start({
            class: 'foam.u2.view.TableView',
            data$: this.data$,
            editColumnsEnabled:false,
            selection:false,
            columns: this.columns
          }).end()
        .end()

        .end()
        .end()
    }
  ],

  listeners: [
    function toggle() {
      this.open = ! this.open;
    }
  ]

});
