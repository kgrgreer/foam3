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
    height: 50px;
    width: 100%;
    background-color: aqua !important;
  }
  
  .error-table-title:hover {
    cursor: pointer;
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
            .add('CLICK HERE')
          .end()

        .start().show(this.open$)
          .start({
            class: 'foam.u2.view.ScrollTableView',
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
