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
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.resultresponse.ContactErrorItem',
    'net.nanopay.accounting.resultresponse.InvoiceErrorItem'
  ],

  css: `
    ^ {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 100vw !important;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
      background: #f9fbff;
      text-align: center;
      overflow-y: scroll;
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
    
     ^ .report-2-container {
      display: inline-block;
      width: 677px;
      min-height: 90vh;
    }
    
    ^ .report-2-container .title {
      font-size: 24px;
      margin-top: 120px;
    }
    
    ^ .report-2-container p {
      font-size: 14px;
    }
    
    ^ .report-2-container-title {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top :20px;
      padding-bottom: 24px;
      font-size: 16px;
      font-weight: 900;
    }
    
    ^ .report-2-container-title img {
      width: 24px;
      height: 24px;
    }
    
    ^ .report-2-container-title p {
      display: inline-box;
    }

    ^ .description {
      margin-top: 15px;
      margin-bottom: -15px;
    }
    
    .report-2-container-title .exclamation-mark {
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }
    
    .contact-tables .error-table-container .foam-u2-view-TableView .foam-u2-view-TableView-th-name, .foam-u2-view-TableView-th-businessName {
      width: 322px;
    }

    .invoice-tables .error-table-container .foam-u2-view-TableView .foam-u2-view-TableView-th-invoiceNumber, .foam-u2-view-TableView-th-Amount, .foam-u2-view-TableView-th-dueDate {
      width: 200px;
    }

    ^ .download-button {
      float: right;
      margin-right: 24px;
      width: 158px;
      height: 48px;
      border-radius: 4px;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      background-color: #ffffff;
      border: solid 1px #604aff;
      color: #604aff;
    }

    ^ .download-button:hover {
      color: #4d38e1;
      background-color: #ffffff !important;
      border-color: #4d38e1;
    }
  }
  `,

  messages: [
    { name: 'TITLE', message: 'Some invoices and contacts failed to sync' },
    { name: 'TEXT', message: 'The following invoices and contacts failed to sync due to missing information.' },
    { name: 'TEXT2', message: 'Fix these errors in ' },
    { name: 'TEXT3', message: ' and sync again. Download the report for you convenience.' },
    { name: 'INVOICES_FAILED', message: 'Invoices failed to sync' },
    { name: 'CONTACTS_FAILED', message: 'Contacts failed to sync ' },
    { name: 'MISSING_CONTACT', message: 'Missing Contact' },
    { name: 'INVALID_CURRENCY', message: 'Invalid Currency'},
    { name: 'UNAUTHORIZED_INVOICE', message: 'Unauthorized Xero Invoice'},
    { name: 'MISSING_BUSINESS_EMAIL', message: 'Missing Business Name & Email' },
    { name: 'MISSING_BUSINESS', message: 'Missing Business Name'},
    { name: 'MISSING_EMAIL', message: 'Missing Email'},
    { name: 'OTHER', message: 'Other'}
  ],

  properties: [
    'reportResult',
    {
      class: 'Int',
      name: 'invoiceCount'
    },
    {
      class: 'Int',
      name: 'contactCount'
    }
  ],

  methods: [
    function initE() {
    let self = this;
console.log(this.reportResult);
      console.log(this.user.integrationCode);
      this
        .start().addClass(this.myClass())
          .start().addClass('report-2-container')

            .start('h1').add(this.TITLE).addClass('title').end()

            .start('p')
              .addClass('description')
              .add(this.TEXT)
            .end()

            .start('p')
              .add(this.TEXT2 + this.user.integrationCode.label + this.TEXT3)
            .end()

        .start('div').addClass('report-2-container-tables')

          .start('div').addClass('report-2-container-title')
            .start()
              .addClass('exclamation-mark')
              .start('img').attrs({ src: 'images/ablii/exclamation-mark.png' }).end()
            .end()
            .start('p').add(this.CONTACTS_FAILED).end()
          .end()

          .call( function() {
            let contactErrors = self.reportResult.contactErrors;
            //let contactErrors = self.temp();

            for ( key of Object.keys(contactErrors) ) {
              if ( contactErrors[key].length !== 0 ) {
                this.start('div').addClass('report-table-container').addClass('contact-tables')
                  .start().tag({
                  class: 'net.nanopay.accounting.ui.ErrorTable', data: self.initInvoiceError(contactErrors[key]), columns: ['name', 'businessName'], header: self.getTableName(key) + ' (' + self.invoiceCount + ')'
                  }).end()
                .end();
              }
            }
          })

        .start('div').addClass('report-2-container-title')
          .start()
            .addClass('exclamation-mark')
            .start('img').attrs({ src: 'images/ablii/exclamation-mark.png' }).end()
          .end()
          .start('p').add(this.INVOICES_FAILED).end()
        .end()

          .call( function() {
            let invoiceErrors = self.reportResult.invoiceErrors;
            //let invoiceErrors = self.temp2();

            for ( key of Object.keys(invoiceErrors) ) {
              if ( invoiceErrors[key].length !== 0 ) {
                this.start('div').addClass('report-table-container').addClass('invoice-tables')
                  .start().tag({
                    class: 'net.nanopay.accounting.ui.ErrorTable', data: self.initContactError(invoiceErrors[key]), columns: ['invoiceNumber', 'Amount', 'dueDate'], header: self.getTableName(key) + ' (' + self.contactCount + ')'
                  })
                  .end()
                .end();
              }
            }
          })

        .end()

          .end()
          .start().addClass('button-bar')
            .start(this.DONE).end()
            .start(this.DOWNLOAD).addClass('download-button').end()
          .end()
        .end();
    },

    function initInvoiceError(arrData) {
      this.invoiceCount = 0;
      let myDAO = foam.dao.MDAO.create( { of: this.ContactErrorItem } );

      for ( x in arrData ) {
        myDAO.put(this.ContactErrorItem.create({
          id: x,
          businessName: arrData[x].businessName,
          name: arrData[x].name
        }))
        this.invoiceCount++;
      }

      return myDAO;
    },

    function initContactError(arrData) {
      this.contactCount = 0;
      let myDAO = foam.dao.MDAO.create( { of: this.InvoiceErrorItem } );

      for ( x in arrData ) {
        myDAO.put(this.InvoiceErrorItem.create({
          id: x,
          invoiceNumber: arrData[x].invoiceNumber,
          Amount: arrData[x].Amount,
          dueDate: arrData[x].dueDate
        }))
        this.contactCount++;
      }

      return myDAO;
    },

    function getTableName(key) {
      switch ( key ) {
        case 'MISS_CONTACT':
          return this.MISSING_CONTACT;
        case 'CURRENCY_NOT_SUPPORT':
          return this.INVALID_CURRENCY;
        case 'UNAUTHORIZED_INVOICE':
          return this.UNAUTHORIZED_INVOICE;
        case 'MISS_BUSINESS_EMAIL':
          return this.MISSING_BUSINESS_EMAIL;
        case 'MISS_BUSINESS':
          return this.MISSING_BUSINESS;
        case 'MISS_EMAIL':
          return this.MISSING_EMAIL;
        default:
          return this.OTHER;
      }
    },

    function temp() {
      return {
        "OTHER": [
          {
            "class": "net.nanopay.accounting.resultresponse.ContactErrorItem",
            "businessName": "NNN",
            "name": "SirenNNN123 ChenNNN"
          },
          {
            "class": "net.nanopay.accounting.resultresponse.ContactErrorItem",
            "businessName": "CCC",
            "name": "CCC EEE"
          }
        ],
        "MISS_BUSINESS": [
          {
            "class": "net.nanopay.accounting.resultresponse.ContactErrorItem",
            "name": "SirenABC ChenABC"
          }
        ],
        "MISS_BUSINESS_EMAIL": [],
        "MISS_EMAIL": []
      }
    },

    function  temp2() {
      return {
        "OTHER": [],
        "CURRENCY_NOT_SUPPORT": [
          {
            "class": "net.nanopay.accounting.resultresponse.InvoiceErrorItem",
            "invoiceNumber": "0092",
            "Amount": "11.0 EUR",
            "dueDate": "2019-03-27T04:00:00.000Z"
          },
          {
            "class": "net.nanopay.accounting.resultresponse.InvoiceErrorItem",
            "invoiceNumber": "0092",
            "Amount": "11.0 EUR",
            "dueDate": "2019-03-27T04:00:00.000Z"
          },
          {
            "class": "net.nanopay.accounting.resultresponse.InvoiceErrorItem",
            "invoiceNumber": "0092",
            "Amount": "11.0 EUR",
            "dueDate": "2019-03-27T04:00:00.000Z"
          }
        ],
        "MISS_CONTACT": []
      }
    }
  ],

  actions: [
    {
      name: 'done',
      label: 'Done',
      code: function() {
        this.pushMenu('sme.main.dashboard');
      }
    },
    {
      name: 'download',
      label: 'Download Report',
      code: function() {


      }
    }
  ]
});
