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
  name: 'AccountingReportPage1',
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
    'net.nanopay.accounting.resultresponse.InvoiceResponseItem',
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
      background: /*%GREY5%*/ #f5f7fa;
      text-align: center;
      overflow-y: auto;
    }
    ^ .report-container {
      display: inline-block;
      width: 100%;
      height: calc(100vh - 92px);
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
    ^ .next-button {
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
    ^ .foam-u2-ActionView-next:hover {
      background-color: #4d38e1 !important;
    }
    ^ .title {
      font-size: 24px;
      font-weight: 900;
      color: black;
      margin-top: 24px;
    }
    ^ .checkmark-img {
      width: 53px;
      height: 53px;
      margin-top: 120px;
    }
    
    ^ .report-table-container {
      max-height: 500px;
      width: 677px;
      margin-top: 25px;
      margin-left: auto; margin-right: auto;
      overflow: hidden;
    }
    
    ^ .report-title-2 {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 80px;
      margin-bottom: -14px;
    }
    
    ^ .report-title-2 p {
      font-size: 16px;
      font-weight: 900;
      line-weight: 1.5
    }
    
    ^ .report-title-img {
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }
    
    ^ .report-title-3 {
      font-size: 14px;
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
      font-size: 16px;
      color: #604aff;
    }

    ^ .download-button:hover {
      color: #4d38e1;
      background-color: #ffffff !important;
      border-color: #4d38e1;
    }

    .error-table-container .foam-u2-view-TableView .foam-u2-view-TableView-th-name, .foam-u2-view-TableView-th-businessName {
      width: 320px;
    }

    .error-table-container .foam-u2-view-TableView .foam-u2-view-TableView-th-invoiceNumber, .foam-u2-view-TableView-th-Amount, .foam-u2-view-TableView-th-dueDate {
      width: 225px;
    }

    .error-table-container .foam-u2-view-TableView thead > tr > th:last-child {
      display: none;
    }

    .error-table-container .foam-u2-view-TableView-net-nanopay-accounting-resultresponse-InvoiceResponseItem tbody > tr > td {
      padding-left: 80px;
    }

    .error-table-container .foam-u2-view-TableView-net-nanopay-accounting-resultresponse-InvoiceResponseItem tbody > tr > td:first-child {
      padding-left: 55px;
    }

    .error-table-container .foam-u2-view-TableView-net-nanopay-accounting-resultresponse-ContactResponseItem tbody > tr > td {
      padding-left: 111px;
    }

    .error-table-container .foam-u2-view-TableView-net-nanopay-accounting-resultresponse-ContactResponseItem tbody > tr > td:nth-child(2) {
      padding-left: 144px;
    }

    ^ .report-2-description {
      margin-top: 14px;
      margin-left: 4px;
      margin-bottom: -10px;
      font-size: 14px;
      text-align: left;
      padding-bottom: 16px;
    }
  `,

  messages: [
    { name: 'SUCCESS_MESSAGE', message: 'Successfully synced contacts and invoices' },
    { name: 'ADDRESS_WARNING', message: `The following contacts are missing a business address. You'll need to add an address before sending them a payment.` }
  ],

  properties: [
    'reportResult',
    {
      class: 'Int',
      name: 'contactCount',
      value: 0
    },
    {
      class: 'Int',
      name: 'contactWarnings',
      value: 0
    },
    {
      class: 'Int',
      name: 'invoiceCount',
      value: 0
    }
  ],

  methods: [
    function initE() {
      if ( ! this.reportResult ) {
        return null;
      }
      this
        .start().addClass(this.myClass())

          .start().addClass('report-container')

            .start('img').addClass('checkmark-img')
              .attrs({ src: 'images/checkmark-large-green.svg' })
            .end()
            .start('h1').add(this.SUCCESS_MESSAGE).addClass('title').end()

            .start('div').addClass('report-table-container')
              .start().tag({
                class: 'net.nanopay.accounting.ui.ErrorTable', data: this.initSuccessContact(), columns: ['businessName', 'name'], header: 'Contacts (' + this.contactCount + ')'
              }).show(this.slot(function(contactCount) {
                return contactCount > 0 ? true : false;
              }))
              .end()
              .start().tag({
                class: 'net.nanopay.accounting.ui.ErrorTable', data: this.initSuccessInvoice(), columns: ['invoiceNumber', 'Amount', 'dueDate'], header: 'Invoices (' + this.invoiceCount + ')'
              }).show(this.slot(function(invoiceCount) {
                return invoiceCount > 0 ? true : false;
              }))
              .end()
              .start()
                .start()
                  .add(this.ADDRESS_WARNING)
                  .addClass('report-2-description')
                .end()
                .tag({
                  class: 'net.nanopay.accounting.ui.ErrorTable', data: this.initContactWarnings(), columns: ['businessName', 'name'], header: 'Missing Business Address (' + this.contactWarnings + ')'
                }).show(this.slot(function(contactWarnings) {
                  return contactWarnings > 0 ? true : false;
                }))
              .end()
            .end()
          .end()

          .start().addClass('button-bar')
            .start(this.NEXT).addClass('next-button').end()
          .end()

        .end();
    },

    function initSuccessContact() {
      let myData = this.reportResult.successContact;
      let myDAO = foam.dao.MDAO.create( { of: this.ContactResponseItem } );

      for ( let x in myData ) {
        myDAO.put(this.ContactResponseItem.create({
          id: x,
          businessName: myData[x].businessName,
          name: myData[x].name
        }))
        this.contactCount++;
      }

      return myDAO;
    },

    function initSuccessInvoice() {
      let myData = this.reportResult.successInvoice;
      let myDAO = foam.dao.MDAO.create( { of: this.InvoiceResponseItem } );

      for ( x in myData ) {
        myDAO.put(this.InvoiceResponseItem.create({
          id: x,
          invoiceNumber: myData[x].invoiceNumber,
          Amount: myData[x].Amount,
          dueDate: myData[x].dueDate
        }))
        this.invoiceCount++;
      }

      return myDAO;
    },

    function initContactWarnings() {
      let myData = this.reportResult.contactErrors;
      let myDAO = foam.dao.MDAO.create( { of: this.ContactResponseItem } );
      for ( let key in myData ) {
        if ( key === 'MISS_ADDRESS' ) {
          for ( x in myData[key] ) {
            myDAO.put(this.ContactResponseItem.create({
              id: x,
              businessName: myData[key][x].businessName,
              name: myData[key][x].name
            }))
            this.contactWarnings++;
          }
        }
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
          doSync: true,
          reportResult: this.reportResult
        });
      }
    }
  ]
});
