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
  package: 'net.nanopay.accounting',
  name: 'AccountingIntegrationUtil',

  documentation: 'Manages the front-end common logic for Accounting Integrations',

  requires: [
    'foam.log.LogLevel',
    'foam.u2.dialog.Popup',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.AccountingErrorCodes',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.accounting.xero.model.XeroInvoice',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice',
    'net.nanopay.accounting.AccountingResultReport'
  ],

  imports: [
    'auth',
    'accountingReportDAO',
    'contactDAO',
    'ctrl',
    'invoiceDAO',
    'quickbooksService',
    'userDAO',
    'xeroService',
    'subject',
    'theme'
  ],

  exports: [
    'showIntegrationModal'
  ],

  messages: [
    { name: 'MISSING_CONTACT', message: 'Missing Contact' },
    { name: 'INVALID_CURRENCY', message: 'Invalid Currency' },
    { name: 'UNAUTHORIZED_INVOICE', message: 'Draft Xero Invoice' },
    { name: 'MISSING_BUSINESS_EMAIL', message: 'Missing Business Name & Email' },
    { name: 'MISSING_BUSINESS', message: 'Missing Business Name' },
    { name: 'MISSING_EMAIL', message: 'Missing Email' },
    { name: 'MISS_ADDRESS', message: 'Missing Business Address' },
    { name: 'OTHER', message: 'Other' },
    { name: 'EXISTING_USER_CONTACT', message: 'There is a contact who is also a user with that email' },
    { name: 'EXISTING_CONTACT', message: 'There is an existing contact with that email' },
    { name: 'EXISTING_USER', message: 'There is already a user with that email' },
    { name: 'EXISTING_USER_MULTI', message: 'The user belongs to multiple businesses' },
    { name: 'REQUIRE_BUSINESS_1', message: 'These contacts have been added to ' },
    { name: 'REQUIRE_BUSINESS_2', message: ' but require a business address' }

  ],

  properties: [
    {
      class: 'Boolean',
      name: 'showIntegrationModal'
    },
    {
      class: 'String',
      name: 'redirectUrl'
    }
  ],

  methods: [
    async function doSync(view, goDashboard) {
      // find the service
      let service = null;

      if ( this.subject.user.integrationCode == this.IntegrationCode.XERO ) {
        service = this.xeroService;
      }
      if ( this.subject.user.integrationCode == this.IntegrationCode.QUICKBOOKS ) {
        service = this.quickbooksService;
      }

      if ( ! service ) return;

      // contact sync
      let contactResult = await service.contactSync(null);
      if ( contactResult.errorCode === this.AccountingErrorCodes.TOKEN_EXPIRED ) {
        this.ctrl.add(this.Popup.create({ closeable: false }).tag({
          class: 'net.nanopay.accounting.AccountingTimeOutModal',
          goDashboard: goDashboard
        }));
        return null;
      }
      if ( ! contactResult.result ) {
        this.ctrl.notify(contactResult.reason, '', this.LogLevel.ERROR, true);
      }

      // invoice sync
      let invoiceResult = await service.invoiceSync(null);
      if ( ! invoiceResult.result ) {
        this.ctrl.notify(contactResult.reason, '', this.LogLevel.ERROR, true);
      }

      // build final result
      let finalResult = contactResult.clone();
      finalResult.invoiceErrors = invoiceResult.invoiceErrors;
      finalResult.successInvoice = invoiceResult.successInvoice;
      this.ctrl.notify('All information has been synchronized', '', this.LogLevel.INFO, true);

      let report = this.AccountingResultReport.create();
      report.userId = this.subject.user.id;
      report.time = new Date();
      report.resultResponse = finalResult;
      report.integrationCode = this.subject.user.integrationCode;
      this.accountingReportDAO.put(report);

      this.userDAO.put(this.subject.user);

      return finalResult;
    },


    async function forceSyncInvoice(invoice) {
      //TODO rename to findInvoice
      //it should be in the list of services
      this.showIntegrationModal = false;
      let service = null;
      let accountingSoftwareName = null;
      if ( this.XeroInvoice.isInstance(invoice) && this.subject.user.id == invoice.createdBy &&(invoice.status == this.InvoiceStatus.UNPAID || invoice.status == this.InvoiceStatus.OVERDUE) ) {
        service = this.xeroService;
        accountingSoftwareName = 'Xero';
        this.redirectUrl = '/service/xeroWebAgent?portRedirect=';
      } else if ( this.QuickbooksInvoice.isInstance(invoice) && this.subject.user.id == invoice.createdBy &&(invoice.status == this.InvoiceStatus.UNPAID || invoice.status == this.InvoiceStatus.OVERDUE) ) {
        service = this.quickbooksService;
        accountingSoftwareName = 'Quickbooks';
        this.redirectUrl = '/service/quickbooksWebAgent?portRedirect=';
      }
      if ( service != null ) {
        let result = await service.singleInvoiceSync(null, invoice);
        if ( ! result.result ) {
          if ( result.errorCode === this.AccountingErrorCodes.TOKEN_EXPIRED || result.errorCode === this.AccountingErrorCodes.NOT_SIGNED_IN || result.errorCode === this.AccountingErrorCodes.INVALID_ORGANIZATION ) {
            this.ctrl.add(this.Popup.create({ onClose: this.callback.bind(this) }).tag({
              class: 'net.nanopay.accounting.ui.AccountingInvoiceSyncModal',
              businessName: invoice.businessName == '' ? null : invoice.businessName,
              accountingSoftwareName: accountingSoftwareName
            }));
          } else {
            this.ctrl.notify(result.reason, '', this.LogLevel.ERROR, true);
          }
          return null;
        }
        return await this.invoiceDAO.find(invoice);
      } else if ( service == null ) {
        return invoice;
      }
    },
    function callback() {
      if ( this.showIntegrationModal ) {
        let service = null;
        if ( this.subject.user.integrationCode == this.IntegrationCode.XERO ) {
          service = this.xeroService;
        } else if ( this.subject.user.integrationCode == this.IntegrationCode.QUICKBOOKS ) {
          service = this.quickbooksService;
        }
        if ( service != null ) {
          service.removeToken(null);
        }
        if ( this.redirectUrl ) {
          var url = window.location.origin + this.redirectUrl + window.location.hash.slice(1);
          var sessionId = localStorage['defaultSession'];
          if ( sessionId ) {
            url += '&sessionId=' + sessionId;
          }
          window.location = url;
        }
      }
    },

    function genPdfReport(reportResult) {
      let doc = new jsPDF();
      doc.myY = 20;

      this.createContactWarningTables(reportResult.contactErrors, doc);
      this.createContactErrorsTables(reportResult.contactErrors, doc);
      this.createInvoiceErrorsTables(reportResult.invoiceErrors, doc);
      this.createContactMismatchTable(reportResult.contactSyncMismatches, doc);

      doc.save(this.subject.user.integrationCode.label + ' sync report.pdf');
    },

    function createContactMismatchTable(mismatch, doc) {
      if ( mismatch.length == 0 ) {
        return;
      }

      let columns = [
        { header: 'Business', dataKey: 'organization' },
        { header: 'Name', dataKey: 'name' },
        { header: 'Message', dataKey: 'message' }
      ];

      let data = [];

      doc.myY = doc.myY + 10;

      for ( let item of mismatch ) {
        data.push({
          organization: item.existContact.organization,
          name: item.existContact.firstName + ' ' + item.existContact.lastName,
          message: this.getMessage(item.resultCode.name)
        });
      }

      doc.text(`Contacts that currently can't be synced`, 14, doc.myY);
      doc.autoTable({
        columns: columns,
        body: data,
        startY: doc.myY + 3
      });

      doc.myY = doc.autoTable.previous.finalY + 20;
    },

    function createContactWarningTables(contactErrors, doc) {
      let columns = [
        { header: 'Business', dataKey: 'organization' },
        { header: 'Name', dataKey: 'name' }
      ];
      for ( let key of Object.keys(contactErrors) ) {
        if ( key === 'MISS_ADDRESS' ) {
          if ( contactErrors[key].length !== 0 ) {
              doc.text('Contact Sync Action Required', 14, doc.myY);
              doc.myY = doc.myY + 10;
              doc.text(this.REQUIRE_BUSINESS_1 + this.theme.appName + this.REQUIRE_BUSINESS_2, 14, doc.myY);
              doc.myY = doc.myY + 7;
              doc.text('before you can pay them.', 14, doc.myY);
            doc.text('', 14, doc.myY);
            doc.autoTable({
              columns: columns,
              body: contactErrors[key],
              startY: doc.myY + 3
            });
            doc.myY = doc.autoTable.previous.finalY + 10;
          }
            columns.pop();
            removeLastItem = false;
        }
      }
    },

    function createContactErrorsTables(contactErrors, doc) {
      let printTitle = true;
      let removeLastItem = false;
      let columns = [
        { header: 'Business', dataKey: 'organization' },
        { header: 'Name', dataKey: 'name' }
      ];
      for ( key of Object.keys(contactErrors) ) {
        if ( key !== 'MISS_ADDRESS' ) {
          if ( key === 'OTHER' ) {
            removeLastItem = true;
            columns.push({ header: 'Message', dataKey: 'message' });
          }
          if ( contactErrors[key].length !== 0 ) {
            if ( printTitle ) {
              doc.text('Contact Sync Errors', 14, doc.myY);
              doc.myY = doc.myY + 10;
              printTitle = false;
            }
            doc.text(this.getTableName(key), 14, doc.myY);
            doc.autoTable({
              columns: columns,
              body: contactErrors[key],
              startY: doc.myY + 3
            });
            doc.myY = doc.autoTable.previous.finalY + 10;
          }
          if ( removeLastItem ) {
            columns.pop();
            removeLastItem = false;
          }
        }
      }
    },

    function createInvoiceErrorsTables(invoiceErrors, doc) {
      let printTitle = true;
      let columns = [
        { header: 'Invoice No.', dataKey: 'invoiceNumber'},
        { header: 'Amount', dataKey: 'Amount'},
        { header: 'Due date', dataKey: 'dueDate'}
      ];

      for ( key of Object.keys(invoiceErrors) ) {
        if ( invoiceErrors[key].length !== 0 ) {
          if ( printTitle ) {
            doc.text('Invoice Sync Errors', 14, doc.myY);
            doc.myY = doc.myY + 10;
            printTitle = false;
          }
          doc.text(this.getTableName(key), 14, doc.myY);
          doc.autoTable({
            columns: columns,
            body: invoiceErrors[key],
            startY: doc.myY + 3
          });
          doc.myY = doc.autoTable.previous.finalY + 10;
        }
      }
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
        case 'MISS_ADDRESS':
          return this.MISS_ADDRESS;
        default:
          return this.OTHER;
      }
    },

    function getMessage(key) {
      switch ( key ) {
        case 'EXISTING_USER_CONTACT':
          return this.EXISTING_USER_CONTACT;
        case 'EXISTING_CONTACT':
          return this.EXISTING_CONTACT;
        case 'EXISTING_USER':
          return this.EXISTING_USER;
        case 'EXISTING_USER_MULTI':
          return this.EXISTING_USER_MULTI;
      }
    },

    async function getPermission() {
      let display = [];
      display[1] = await this.auth.check(null, 'service.xeroService');
      display[2] = await this.auth.check(null, 'service.quickbooksService');
      display[0] = display[1] || display[2];
      return display;
    }
  ]
});
