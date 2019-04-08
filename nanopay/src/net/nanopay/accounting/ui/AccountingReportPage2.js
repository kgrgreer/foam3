foam.CLASS({
  package: 'net.nanopay.accounting.ui',
  name: 'AccountingReportPage2',
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
    ^ {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
      background: #f9fbff;
      text-align: center
    }
    
    ^ .report-2-container {
      display: inline-block;
      width: 100%;
      height: 90vh;
    }
    
    ^ .button-bar {
      margin-top:20px;
      height: 48px;
      background-color: #ffffff;
      padding-top: 12px;
      padding-bottom: 12px;
      padding-right: 24px;
    }
    ^ .net-nanopay-ui-ActionView-done {
      width: 158px;
      height: 48px !important;
      border-radius: 4px;
      border: 1px solid #4a33f4;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      background-color: #604aff !important;
      font-size: 14px !important;
      font-weight: 400;
      float:right;
      color: #FFFFFF !important;
    }
    ^ .net-nanopay-ui-ActionView-done:hover {
      background-color: #4d38e1 !important;
    }
    
    ^ .report-2-container .title {
      font-size: 24px;
      margin-top: 120px;
    }
    
    ^ .report-2-container p {
      font-size: 14px;
    }
  `,

  messages: [
    { name: 'Title', message: 'Some invoices and contacts failed to sync' },
    { name: 'Text', message: 'The following invoices and contacts failed to sync due to missing information.' },
    { name: 'Text2', message: 'Fix these errors in ' },
    { name: 'Text3', message: ' and sync again.' },
    { name: 'Invoice_failed', message: 'Invoices failed to sync' },
    { name: 'Contacts_failed', message: 'Contacts failed to sync ' }
  ],

  properties: [
    'reportResult'
  ],

  methods: [
    function initE() {

      console.log(this.user.integrationCode);
      this
        .start().addClass(this.myClass())
          .start().addClass('report-2-container')

            .start('h1').add(this.Title).addClass('title').end()

            .start('p')
              .add('The following invoices and contacts failed to sync due to missing information.')
            .end()

            .start('p')
              .add('Fix these errors in ' + this.user.integrationCode.label + ' and sync again. Download the report for you convenience.')
            .end()

          .end()
          .start().addClass('button-bar')
            .start(this.DONE).end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'done',
      label: 'Done',
      code: function() {
        this.pushMenu('sme.main.dashboard');
      }
    }
  ]
});
