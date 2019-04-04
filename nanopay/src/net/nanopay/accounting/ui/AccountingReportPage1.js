foam.CLASS({
  package: 'net.nanopay.accounting.ui',
  name: 'AccountingReportPage1',
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
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.resultresponse.ContactErrorItem',
    'foam.dao.EasyDAO'
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
    ^ .report-container {
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
    ^ .net-nanopay-ui-ActionView-next {
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
    ^ .net-nanopay-ui-ActionView-next:hover {
      background-color: #4d38e1 !important;
    }
    ^ .title {
      font-size: 24px;
      font-weight: 900;
      color: black;
      margin-top: 24px;
    }
    ^ .checkmark-img {
      margin-top: 120px;
    }
  `,

  messages: [
    { name: 'SuccessMessage', message: 'Successfully synced contacts and invoices' },
    { name: 'EXISTING_CONTACT', message: 'existing contact'},
    { name: 'EXISTING_USER', message: 'existing user'},
    { name: 'EXISTING_USER_MULTI', message: 'existing user belong to multiple business'},
    { name: 'EXISTING_USER_CONTACT', message: 'existing user also contact'},
  ],

  properties: [
    'reportResult',
  ],

  methods: [
    function initE() {
      this
        .start().addClass(this.myClass())

          .start().addClass('report-container')

            .start('img').addClass('checkmark-img')
              .attrs({ src: 'images/checkmark-large-green.svg' })
            .end()
            .start('h1').add(this.SuccessMessage).addClass('title').end()

            .start().tag({ class: 'net.nanopay.accounting.ui.ErrorTable', data: this.initMismatchData(), columns: ['name','businessName', 'message'] }).end()

          .end()

          .start().addClass('button-bar')
            .start(this.NEXT).end()
          .end()

        .end();
    },

    function initMismatchData() {
      let myData = this.reportResult.contactSyncMismatches;
      let myDAO = foam.dao.MDAO.create( {of: this.ContactErrorItem} );

      for ( x in myData ) {
        myDAO.put(this.ContactErrorItem.create({
          id: x,
          businessName: myData[x].existContact.businessName,
          name: myData[x].existContact.firstName + " " + myData[x].existContact.lastName,
          message: this[myData[x].resultCode.name]
        }))
      }

      return myDAO;
    },
  ],

  actions: [
    {
      name: 'next',
      label: 'Next',
      code: function() {
        this.stack.push({
          class: 'net.nanopay.accounting.ui.AccountingReportPage2',
          doSync: true
        });
      }
    }
  ]
});
