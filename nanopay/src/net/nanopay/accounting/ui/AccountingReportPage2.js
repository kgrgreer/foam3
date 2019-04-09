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
      padding-top :40px;
      padding-bottom: 24px;
    }
    
    ^ .report-2-container-title img {
      width: 24px;
      height: 24px;
    }
    
    ^ .report-2-container-title p {
      display: inline-box;
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
    let self = this;

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

        .start('div').addClass('report-2-container-tables')

          .start('div').addClass('report-2-container-title')
            .start('img')
              .attrs({ src: 'images/ablii/exclamation-mark.png' })
            .end()
            .start('p').add('Contacts failed to sync').end()
          .end()

          .call( function() {
            let contactErrors = self.reportResult.contactErrors;
            //let contactErrors = self.temp();

            for ( key of Object.keys(contactErrors) ) {
              if ( contactErrors[key].length !== 0 ) {
                this.start('div').addClass('report-table-container')
                  .start().tag({
                  class: 'net.nanopay.accounting.ui.ErrorTable', data: self.initData(contactErrors[key]), columns: ['name','businessName'], header:'Ablii users'
                  }).end()
                .end()
              }
            }
          })

        .start('div').addClass('report-2-container-title')
          .start('img')
            .attrs({ src: 'images/ablii/exclamation-mark.png' })
          .end()
          .start('p').add('Invoices failed to sync').end()
        .end()

          .call( function() {
            let invoiceErrors = self.reportResult.invoiceErrors;
            //let invoiceErrors = self.temp2();

            for ( key of Object.keys(invoiceErrors) ) {
              if ( invoiceErrors[key].length !== 0 ) {
                this.start('div').addClass('report-table-container')
                  .start().tag({
                  class: 'net.nanopay.accounting.ui.ErrorTable', data: self.initContactError(invoiceErrors[key]), columns: ['invoiceNumber','Amount', 'dueDate'], header:'Ablii users'
                }).end()
                  .end()
              }
            }
          })

        .end()

          .end()
          .start().addClass('button-bar')
            .start(this.DONE).end()
          .end()
        .end();
    },

    function initData(arrData) {
      let myDAO = foam.dao.MDAO.create( {of: this.ContactErrorItem} );

      for ( x in arrData ) {
        myDAO.put(this.ContactErrorItem.create({
          id: x,
          businessName: arrData[x].businessName,
          name: arrData[x].name
        }))
      }

      return myDAO;
    },

    function initContactError(arrData) {
      let myDAO = foam.dao.MDAO.create( {of: this.InvoiceErrorItem} );

      for ( x in arrData ) {
        console.log(arrData[x].dueDate)
        myDAO.put(this.InvoiceErrorItem.create({
          id: x,
          invoiceNumber: arrData[x].invoiceNumber,
          Amount: arrData[x].Amount,
          dueDate: arrData[x].dueDate
        }))
      }

      return myDAO;
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
    }
  ]
});
