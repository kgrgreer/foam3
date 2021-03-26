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
  package: 'net.nanopay.accounting.ui',
  name: 'AccountingReportPage2',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO',
    'accountingIntegrationUtil',
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
    'net.nanopay.accounting.resultresponse.ContactResponseItem',
    'net.nanopay.accounting.resultresponse.InvoiceResponseItem'
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
      background: /*%GREY5%*/ #f5f7fa;
      text-align: center;
      overflow-y: auto;
    }
    
    ^ .button-bar {
      margin-top:20px;
      height: 48px;
      background-color: #ffffff;
      padding-top: 12px;
      padding-bottom: 12px;
      padding-right: 24px;
    }
    ^ .done-button {
      width: 158px;
      height: 48px !important;
      border-radius: 4px;
      border: 1px solid #4a33f4;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      background-color: #604aff !important;
      font-size: 16px !important;
      font-weight: 400;
      float:right;
      color: #FFFFFF !important;
    }
    ^ .foam-u2-ActionView-done:hover {
      background-color: #4d38e1 !important;
    }
    
    ^ .report-2-container {
      display: inline-block;
      width: 677px;
      height: calc(100vh - 92px);
    }
    
    ^ .report-2-container .title {
      font-size: 24px;
      margin-top: 120px;
    }
    
    ^ .report-2-container-title {
      display: flex;
      align-items: center;
      padding-top :40px;
      font-size: 16px;
      font-weight: 900;
    }

    ^ .report-2-description {
      font-size: 14px;
      text-align: left;
      padding-bottom: 16px;
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

    .contact-tables .error-table-container .foam-u2-view-TableView .foam-u2-view-TableView-th-name, .foam-u2-view-TableView-th-businessName, .foam-u2-view-TableView-th-message {
      width: 225px;
    }
    .contact-tables .error-table-container .other .foam-u2-view-TableView .foam-u2-view-TableView-th-name, .foam-u2-view-TableView-th-businessName {
      width: 200px;
    }
    .invoice-tables .error-table-container .foam-u2-view-TableView .foam-u2-view-TableView-th-invoiceNumber, .foam-u2-view-TableView-th-Amount, .foam-u2-view-TableView-th-dueDate {
      width: 200px;
    }

    .invoice-tables .error-table-container .other .foam-u2-view-TableView .foam-u2-view-TableView-th-invoiceNumber, .foam-u2-view-TableView-th-Amount, .foam-u2-view-TableView-th-dueDate {
      width: 150px;
    }

    .contact-mismatch-table .error-table-container .foam-u2-view-TableView .foam-u2-view-TableView-th-name, .foam-u2-view-TableView-th-businessName, .foam-u2-view-TableView-th-message {
      width: 200px;
    }

    .contact-tables .error-table-container .foam-u2-view-TableView tbody > tr > td {
      padding-left: 153px;
    }

    .contact-tables .error-table-container .foam-u2-view-TableView tbody > tr > td:nth-child(2) {
      padding-left: 102px;
    }

    .contact-tables .error-table-container .other .foam-u2-view-TableView tbody > tr > td {
      padding-left: 56px;
    }

    .contact-tables .error-table-container .other .foam-u2-view-TableView tbody > tr > td:first-child {
      padding-left: 87px;
    }

    .invoice-tables .error-table-container .foam-u2-view-TableView tbody > tr > td {
      padding-left: 80px;
    }

    .invoice-tables .error-table-container .foam-u2-view-TableView tbody > tr > td:first-child {
      padding-left: 54px;
    }

    .invoice-tables .error-table-container .other .foam-u2-view-TableView tbody > tr > td {
      padding-left: 56px;
    }

    .contact-mismatch-table .error-table-container .foam-u2-view-TableView tbody > tr > td {
      padding-left: 56px;
    }

    ^ .download-button {
      float: right;
      margin-right: 24px;
      width: 158px;
      height: 48px;
      border-radius: 4px;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      background-color: #ffffff;
      font-size: 16px;
      border: solid 1px #604aff;
      color: #604aff;
    }

    ^ .download-button:hover {
      color: #4d38e1;
      background-color: #ffffff !important;
      border-color: #4d38e1;
    }
    ^ .container-overflow {
      overflow-y: auto;
    }
  }
  `,

  messages: [
    { name: 'TITLE', message: 'Some invoices and contacts failed to sync' },
    { name: 'TEXT', message: ' Fix these errors in ' },
    { name: 'TEXT2', message: ' and sync again. Download the report for you convenience.' },
    { name: 'CONTACT_TEXT', message: 'The following contacts failed to sync due to missing information.' },
    { name: 'INVOICE_TEXT', message: 'The following invoices failed to sync due to missing information.' },
    { name: 'MISMATCH_TEXT', message: 'The following contacts failed to sync due to technical difficulties. We apologize for your inconvenience. Please contact our support team for more details.' },
    { name: 'MISMATCH', message: `Contacts and Invoices that currently can't be synced` },
    { name: 'INVOICES_FAILED', message: 'Invoices failed to sync' },
    { name: 'CONTACTS_FAILED', message: 'Contacts failed to sync ' },
  ],

  properties: [
    'reportResult',
    'quickSyncRedirect',
    {
      class: 'Int',
      name: 'invoiceCount'
    },
    {
      class: 'Int',
      name: 'contactCount'
    },
    {
      class: 'Int',
      name: 'mismatchCount'
    },
    {
      class: 'Boolean',
      name: 'showContactError',
      value: false
    },
    {
      class: 'Boolean',
      name: 'showInvoiceError',
      value: false
    },
    {
      class: 'Boolean',
      name: 'showMismatch',
      value: false
    }
  ],

  methods: [
    function initE() {
    let self = this;
    this.showContactError = this.showtable(this.reportResult.contactErrors);
    this.showInvoiceError = this.showtable(this.reportResult.invoiceErrors);
    this.showMismatch = this.showtable(this.reportResult.contactSyncMismatches);

    this
      .start().addClass(this.myClass())
        .start().addClass('container-overflow')
          .start().addClass('report-2-container')

            .start('h1').add(this.TITLE).addClass('title').end()

            .start('div').addClass('report-2-container-tables')

              .start('div').addClass('report-2-container-title').show(this.showContactError$)
                .start()
                  .addClass('exclamation-mark')
                  .start('img').attrs({ src: 'images/ablii/warning-triangle.svg' }).end()
                .end()
                .start('p').add(this.CONTACTS_FAILED).end()
              .end()
              .start().show(this.showContactError$)
                .add(this.CONTACT_TEXT + this.TEXT + this.user.integrationCode.label + this.TEXT2)
                .addClass('report-2-description')
              .end()
              .call( function() {
                let contactErrors = self.reportResult.contactErrors;
                for ( let key of Object.keys(contactErrors) ) {
                  if ( contactErrors[key].length !== 0 && key !== 'MISS_ADDRESS' ) {
                    this.showContactError = true;
                    this.start('div').addClass('report-table-container').addClass('contact-tables')
                      .start().tag({
                      class: 'net.nanopay.accounting.ui.ErrorTable', data: self.initContactError(contactErrors[key]), columns: ['name', 'businessName'], header: self.accountingIntegrationUtil.getTableName(key) + ' (' + self.contactCount + ')'
                      }).end()
                    .end();
                  }
                }
              })

              .start().addClass('report-2-container-title').show(this.showInvoiceError$)
                .start()
                  .addClass('exclamation-mark')
                  .start('img').attrs({ src: 'images/ablii/warning-triangle.svg' }).end()
                .end()
                .start('p').add(this.INVOICES_FAILED).end()
              .end()
              .start().show(this.showInvoiceError$)
                .add(this.INVOICE_TEXT + this.TEXT + this.user.integrationCode.label + this.TEXT2)
                .addClass('report-2-description')
              .end()
              .call( function() {
                let invoiceErrors = self.reportResult.invoiceErrors;
                for ( key of Object.keys(invoiceErrors) ) {
                  if ( invoiceErrors[key].length !== 0 ) {
                    this.showInvoiceError = true;
                    this.start('div').addClass('report-table-container').addClass('invoice-tables')
                      .start().tag({
                        class: 'net.nanopay.accounting.ui.ErrorTable', data: self.initInvoiceError(invoiceErrors[key]), columns: ['invoiceNumber', 'Amount', 'dueDate'], header: self.accountingIntegrationUtil.getTableName(key) + ' (' + self.invoiceCount + ')'
                      })
                      .end()
                    .end();
                  }
                }
              })

              .start().show(this.showMismatch$)
                .start('div').addClass('report-2-container-title')
                  .start()
                    .addClass('exclamation-mark')
                    .start('img').attrs({ src: 'images/ablii/error.svg' }).end()
                  .end()
                  .start('p').add(this.MISMATCH).end()
                .end()
                .start()
                  .add(this.MISMATCH_TEXT)
                  .addClass('report-2-description')
                .end()

                .start('div').addClass('report-table-container').addClass('contact-mismatch-table')
                  .start().tag({
                    class: 'net.nanopay.accounting.ui.ErrorTable', data: this.initMismatchData(), columns: ['name', 'businessName', 'message'], header: 'Contacts (' + self.mismatchCount + ')'
                  }).end()
                .end()
              .end()
            .end()
          .end()
        .end()
        .start().addClass('button-bar')
          .start(this.DONE).addClass('done-button').end()
          .start(this.DOWNLOAD).addClass('download-button').end()
        .end()
      .end();
      if ( ! this.showContactError && ! this.showInvoiceError ) {
        this.pushMenu('mainmenu.dashboard');
      }
    },

    function initContactError(arrData) {
      this.contactCount = 0;
      let myDAO = foam.dao.MDAO.create( { of: this.ContactResponseItem } );
      for ( x in arrData ) {
        myDAO.put(this.ContactResponseItem.create({
          id: x,
          businessName: arrData[x].businessName,
          name: arrData[x].name,
          message: arrData[x].message != null ? arrData[x].message : null
        }))
        this.contactCount++;
      }

      return myDAO;
    },

    function initInvoiceError(arrData) {
      this.invoiceCount = 0;
      let myDAO = foam.dao.MDAO.create( { of: this.InvoiceResponseItem } );

      for ( let x in arrData ) {
        myDAO.put(this.InvoiceResponseItem.create({
          id: x,
          invoiceNumber: arrData[x].invoiceNumber,
          Amount: arrData[x].Amount,
          dueDate: arrData[x].dueDate,
          message: arrData[x].message != null ? arrData[x].message : null
        }))
        this.invoiceCount++;
      }

      return myDAO;
    },

    function showtable(tableErrors) {
      for ( key of Object.keys(tableErrors) ) {
        if ( tableErrors[key].length !== 0 ) {
          return true;
        }
      }
      return false;
    },

    function initMismatchData() {
      let myData = this.reportResult.contactSyncMismatches;
      let myDAO = foam.dao.MDAO.create( { of: this.ContactResponseItem } );

      for ( x in myData ) {
        myDAO.put(this.ContactResponseItem.create({
          id: x,
          businessName: myData[x].existContact.businessName,
          name: myData[x].existContact.firstName + " " + myData[x].existContact.lastName,
          message: this.accountingIntegrationUtil.getMessage(myData[x].resultCode.name)
        }))
        this.mismatchCount++;
      }

      return myDAO;
    }
  ],

  actions: [
    {
      name: 'done',
      label: 'Done',
      code: function() {
        this.pushMenu('mainmenu.dashboard');
      }
    },
    {
      name: 'download',
      label: 'Download Report',
      code: function() {
        this.accountingIntegrationUtil.genPdfReport(this.reportResult);
      }
    }
  ]
});
