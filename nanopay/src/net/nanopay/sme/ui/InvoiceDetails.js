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
  package: 'net.nanopay.sme.ui',
  name: 'InvoiceDetails',
  extends: 'foam.u2.View',

  documentation: `Reusable invoice details view can show both payables &
                  receivables information`,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.core.PromiseSlot',
    'foam.log.LogLevel',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  imports: [
    'currencyDAO',
    'notify',
    'subject'
  ],

  css: `
    ^ {
      background: #fff;
      border-radius: 3px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
      border: solid 1px #e2e2e3;
      padding: 24px;
    }
    ^ .invoice-title {
      width: 360px;
      font-size: 18px;
      display: inline-block;
    }
    ^invoice-content-block {
      display: inline-block;
      vertical-align: top;
      width: 50%;
      }
    ^invoice-content-text {
      color: #8e9090;
      line-height: 1.5;
    }
    ^ .invoice-note {
      display: inline-block;
      max-height: 260px;
    }
    ^ .text-fade-out {
      background-image: linear-gradient(90deg, #000000 70%, rgba(0,0,0,0));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      overflow: hidden;
      white-space: nowrap;
    }
    ^ .sme-invoice-status {
      float: right;
    }
    ^ .invoice-content {
      border-top: solid 1px #e2e2e3;
      margin-top: 7px;
      padding-top: 23px;
    }
    ^ .invoice-row {
      margin-bottom: 32px;
    }
    ^ .subdued-text {
      margin-top: 5px;
    }
    ^ .invoice-status-container {
      float: right;
      margin-top: -35px;
    }
    ^attachment-row {
      margin-bottom: 5px;
    }
    ^attachment {
      text-decoration: underline;
      color: #604aff;
      cursor: pointer;
      display: inline-block;
      vertical-align: middle;
      white-space: nowrap;
      width: 400px;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    ^attachment-icon {
      margin-right: 8px;
      vertical-align: middle;
    }
    ^issue-date-block {
      display: inline-block;
      margin-left: 45px;
    }
    ^print-wrapper {
      margin-top: 10px;
      display: flex;
      justify-content: flex-end;
    }
    ^link-icon {
      margin-right: 5px !important;
      display: inline;
    }
    ^italic {
      font-style: italic;
    }
    ^ .bold-label {
      line-height: 1.5;
    }
    ^ .reference-id-text {
      font-size: 12px;
    }
    ^ .note {
      white-space: pre-line;
    }
    @media print {
      ^ .note {
        white-space: normal;
      }
    }
  `,

  constants: [
    {
      type: 'String',
      name: 'PRINT_ICON',
      value: 'images/print-resting.svg'
    },
    {
      type: 'String',
      name: 'PRINT_ICON_HOVER',
      value: 'images/print-hover.svg'
    },
    {
      type: 'String',
      name: 'EXPORT_ICON',
      value: 'images/export-icon-resting.svg'
    },
    {
      type: 'String',
      name: 'EXPORT_ICON_HOVER',
      value: 'images/export-icon-hover.svg'
    }
  ],

  properties: [
    'invoice',
    {
      class: 'Boolean',
      name: 'showActions',
      value: true,
      documentation: `Only display print & export icons when this class is used
                      in the single payable/receivable overview.`
    },
    {
      class: 'String',
      name: 'formattedAmount',
      documentation: 'formattedAmount contains the currency symbol.',
      expression: function(invoice, invoice$destinationCurrency, invoice$amount) {
        // Format the amount & add the currency symbol
        if ( invoice$destinationCurrency !== undefined ) {
          return this.currencyDAO.find(invoice$destinationCurrency).then((currency) => {
            return currency.format(invoice$amount);
          });
        }
        return Promise.resolve();
      },
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'payer',
      expression: function(invoice$payer, invoice$payerId, subject$user$id, subject, invoice$contactId) {
        if ( ! invoice$payer && invoice$payerId ) {
          if ( invoice$payerId === subject$user$id ) {
            return Promise.resolve(this.PublicUserInfo.create(subject.user));
          } else {
            return Promise.resolve(subject.user.contacts.find(invoice$contactId).then(
              (u) => this.PublicUserInfo.create(u)
            ));
          }
        } else {
          return Promise.resolve(invoice$payer);
        }
      },
    },
    {
      class: 'Date',
      name: 'dueDate',
      expression: function(invoice$dueDate) {
        return invoice$dueDate ?
          invoice$dueDate.toLocaleDateString(foam.locale) : '';
      },
    },
    {
      class: 'Date',
      name: 'issueDate',
      expression: function(invoice$issueDate) {
        return invoice$issueDate ?
          invoice$issueDate.toLocaleDateString(foam.locale) : '';
      },
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'payee',
      expression: function(invoice$payee, invoice$payeeId, subject$user$id, subject, invoice$contactId) {
        if ( ! invoice$payee && invoice$payeeId ) {
          if ( invoice$payeeId === subject$user$id ) {
            return Promise.resolve(this.PublicUserInfo.create(subject.user));
          } else {
            return Promise.resolve(subject.user.contacts.find(invoice$contactId).then(
              (u) => this.PublicUserInfo.create(u)));
          }
        } else {
          return Promise.resolve(invoice$payee);
        }
      },
    }
  ],

  messages: [
    { name: 'ATTACHMENT_LABEL', message: 'Attachments' },
    { name: 'AMOUNT_LABEL', message: 'Amount due' },
    { name: 'REFERENCE_LABEL', message: 'Reference ID' },
    { name: 'DUE_DATE_LABEL', message: 'Due date' },
    { name: 'INVOICE_NUMBER_LABEL', message: 'Invoice number' },
    { name: 'BILLING_INVOICE_NUMBER_LABEL', message: 'Billing Invoice number' },
    { name: 'ISSUE_DATE_LABEL', message: 'Issue date' },
    { name: 'LINE_ITEMS', message: 'Items' },
    { name: 'NOTE_LABEL', message: 'Notes' },
    { name: 'PAYEE_LABEL', message: 'Payment to' },
    { name: 'PAYER_LABEL', message: 'Payment from' },
    { name: 'PO_NO_LABEL', message: 'Purchase order number' },
    { name: 'CYCLE_LABEL', message: 'Billing Cycle: '},
    { name: 'SAVE_AS_PDF_FAIL', message: 'There was an unexpected error when creating the PDF. Please contact support.' },
    { name: 'NO_ATTACHEMENT_PROVIDED', message: 'No attachments provided'},
    { name: 'NO_NOTES_PROVIDED', message: 'No notes provided'},
  ],

  methods: [
    function initE() {
      var self = this;
      var isBillingInvoice = net.nanopay.invoice.model.BillingInvoice.isInstance(this.invoice);

      this
        .addClass(this.myClass())
        .start()
          .addClass('medium-header')
          .addClass('inline')
          .add(this.slot(function(invoice$invoiceNumber) {
            return isBillingInvoice ?
              `${self.BILLING_INVOICE_NUMBER_LABEL} ${invoice$invoiceNumber}` :
              `${self.INVOICE_NUMBER_LABEL} ${invoice$invoiceNumber}`;
          }))
        .end()
        .start()
          .show( ! isBillingInvoice )
          .addClass(this.myClass('invoice-content-text'))
          .add(this.slot(function(invoice$purchaseOrder) {
            return self.PO_NO_LABEL + invoice$purchaseOrder;
          }))
        .end()
        .start()
          .show( isBillingInvoice )
          .addClass(this.myClass('invoice-content-text'))
          .add(this.slot(function(invoice) {
            if ( isBillingInvoice )
              return self.CYCLE_LABEL + invoice.billingStartDate.toLocaleDateString(foam.locale)
                + " to " + invoice.billingEndDate.toLocaleDateString(foam.locale);
          }))
        .end()
        .add(this.slot(function(invoice, invoice$status) {
          var e = self.E();
          invoice.STATUS.tableCellFormatter.format(
            e, invoice$status, invoice, invoice.STATUS);
          return e;
        }))
        .start().addClass('invoice-content')
          .start()
            .addClass('invoice-row')
            .start()
              .addClass(this.myClass('invoice-content-block'))
              .start()
                .addClass('bold-label')
                .add(this.PAYER_LABEL)
              .end()
              .start().addClass(this.myClass('invoice-content-text'))
                .add(this.payer$.map(function(payer) {
                  return payer.then(function(payer) {
                    if ( payer != null ) {
                      var address = payer.address;
                      return self.E()
                        .start().add(payer.toSummary()).end()
                        .start().add(self.formatStreetAddress(address)).end()
                        .start().add(self.formatRegionAddress(address)).end()
                        .start().add(address != undefined ? address.postalCode : '').end();
                      }
                  });
                }))
              .end()
            .end()
            .start()
              .addClass(this.myClass('invoice-content-block'))
              .start()
                .addClass('bold-label')
                .add(this.PAYEE_LABEL)
              .end()
              .start().addClass(this.myClass('invoice-content-text'))
                .add(this.payee$.map(function(payee) {
                  return payee.then(function(payee) {
                    if ( payee != null ) {
                      return self.E()
                        .start().add(payee.toSummary()).end();
                    }
                  });
                }))
              .end()
            .end()
          .end()
          .start()
            .addClass('invoice-row')
            .start()
              .addClass('bold-label')
              .add(this.AMOUNT_LABEL)
            .end()
            .start().addClass(this.myClass('invoice-content-text'))
              .add(this.PromiseSlot.create({
                promise$: this.formattedAmount$,
                value: '--',
              }))
            .end()
          .end()
          .start()
            .addClass('invoice-row')
            .start().addClass(this.myClass('invoice-content-block'))
              .start()
                .addClass('bold-label')
                .add(this.DUE_DATE_LABEL)
              .end()
              .start()
                .addClass(this.myClass('invoice-content-text'))
                .add(this.dueDate$)
              .end()
            .end()
            .start().addClass(this.myClass('invoice-content-block'))
              .start()
                .addClass('bold-label')
                .add(this.ISSUE_DATE_LABEL)
              .end()
              .start()
                .addClass(this.myClass('invoice-content-text'))
                .add(this.issueDate$)
              .end()
            .end()
          .end()
          .start()
            .addClass('invoice-row')
            .show(isBillingInvoice)
            .start()
              .add(this.LINE_ITEMS)
              .addClass('bold-label')
            .end()
            .start()
              .addClass(this.myClass('invoice-content-text'))
              .add(this.slot(function(invoice$lineItems) {
                if ( invoice$lineItems.length !== 0 ) {
                  return self.E()
                    .startContext({
                      data: self.invoice,
                      controllerMode: foam.u2.ControllerMode.VIEW
                    })
                      .add(self.Invoice.LINE_ITEMS)
                    .endContext();
                } else {
                 return self.E()
                   .start()
                     .addClass(this.myClass('invoice-content-block'))
                     .addClass(this.myClass('invoice-content-text'))
                     .addClass(this.myClass('italic'))
                     .add('No items provided')
                   .end();
                }
              }))
            .end()
          .end()
        .end()
        .start().addClass('invoice-row')
          .start()
            .add(this.ATTACHMENT_LABEL)
            .addClass('bold-label')
          .end()
          .start()
            .add(this.slot(function(invoice$invoiceFile) {
              if ( invoice$invoiceFile.length !== 0 ) {
                return self.E().forEach(invoice$invoiceFile, function(file) {
                  this
                    .start()
                      .addClass(self.myClass('attachment-row'))
                      .start('img')
                        .addClass('icon')
                        .addClass(self.myClass('attachment-icon'))
                        .attr('src', 'images/attach-icon.svg')
                      .end()
                      .start().addClass(self.myClass('attachment'))
                        .add(file.filename)
                        .on('click', () => {
                          // If file.id is not empty, the invoice is created
                          // and the uploaded file is saved
                          if ( file.id ) {
                            window.open(file.address);
                          } else {
                            // The uploaded file only exists temporarily
                            window.open(URL.createObjectURL(file.data.blob));
                          }
                        })
                      .end()
                    .end();
                });
              } else {
                return self.E()
                  .start()
                    .addClass(this.myClass('invoice-content-block'))
                    .addClass(this.myClass('invoice-content-text'))
                    .addClass(this.myClass('italic'))
                    .add(this.NO_ATTACHEMENT_PROVIDED)
                  .end();
              }
            }))
          .end()
        .end()
        .start().addClass('invoice-row')
          .start()
            .addClass('bold-label')
            .add(this.NOTE_LABEL)
          .end()
          .start('span')
            .addClass(this.myClass('invoice-content'))
            .addClass(this.myClass('invoice-content-text'))
            .addClass('invoice-note')
            .add(this.slot(function(invoice$note) {
              if ( invoice$note ) {
                return self.E()
                  .start()
                  .addClass('note')
                    .add(invoice$note)
                  .end();
              } else {
                return self.E()
                  .start().addClass(this.myClass('italic'))
                    .add(this.NO_NOTES_PROVIDED)
                  .end();
              }
            }))
          .end()
        .end()
        .start()
          .addClass(this.myClass('invoice-content-text'))
          .addClass('reference-id-text')
          .add(this.slot(function(invoice$referenceId) {
            return self.REFERENCE_LABEL + ' ' + invoice$referenceId;
          }))
        .end()
        .start()
          .show(this.showActions)
          .addClass(this.myClass('print-wrapper'))
          .start()
            .addClass('sme').addClass('link-button')
            .addClass(this.myClass('link-icon'))
            .start('img')
              .addClass('icon')
              .addClass(this.myClass('align-top'))
              .attr('src', this.PRINT_ICON)
            .end()
            .start('img')
              .addClass('icon').addClass('hover')
              .addClass(this.myClass('align-top'))
              .attr('src', this.PRINT_ICON_HOVER)
              .on('click', () => window.print())
            .end()
          .end()

          .start()
            .addClass('sme').addClass('link-button')
            .addClass(this.myClass('link-icon'))
            .start('img')
              .addClass('icon')
              .addClass(this.myClass('align-top'))
              .attr('src', this.EXPORT_ICON)
            .end()
            .start('img')
              .addClass('icon').addClass('hover')
              .addClass(this.myClass('align-top'))
              .attr('src', this.EXPORT_ICON_HOVER)
              .on('click', () => this.exportAsPDF())
            .end()
          .end()
        .end()
      .end();
    },

    function formatStreetAddress(address) {
      var formattedAddress = '';
      if ( ! address ) return '';
      if ( address.structured ) {
        if ( address.streetNumber ) formattedAddress += address.streetNumber;
        if ( address.streetName ) formattedAddress += ' ' + address.streetName;
        if ( address.suite ) formattedAddress += ' #' + address.suite;
      } else {
        if ( address.address1 ) formattedAddress += address.address1;
        if ( address.address2 ) formattedAddress += ' #' + address.address2;
      }
      return formattedAddress;
    },

    function formatRegionAddress(address) {
      var formattedAddress = '';
      if ( ! address ) return '';
      if ( address.city ) formattedAddress += address.city;
      if ( address.regionId ) {
        formattedAddress ? formattedAddress += ', ' + address.regionId
            : formattedAddress += address.regionId;
      }
      if ( address.countryId ) {
        formattedAddress ? formattedAddress += ', ' + address.countryId
            : formattedAddress += address.countryId;
      }
      return formattedAddress;
    }
  ],

  listeners: [
    function exportAsPDF() {
      try {
        window.scrollTo(0,0);
        var className = '.full-invoice';
        var downloadContent = ctrl.document.querySelector(className);
        downloadContent.style.backgroundColor = '#fff';
        downloadContent.style.margin = '350px 50px 250px 50px';
        downloadContent.style.padding = '350px 50px 250px 50px';
        downloadContent.offsetParent.style.margin = '120px 40px 120px 40px';
        downloadContent.offsetParent.style.zoom = '60%';

        downloadContent.offsetParent.style.width = downloadContent.scrollWidth + downloadContent.offsetParent.scrollWidth + 'px';
        downloadContent.offsetParent.style.height = downloadContent.scrollHeight + downloadContent.offsetParent.scrollHeight + 'px';

        var doc = new jsPDF('p', 'pt');

        doc.addHTML(downloadContent, () => {
           doc.save(`invoice-${this.invoice.referenceId}.pdf`);
        });

        downloadContent.style.backgroundColor = '#f9fbff';
        downloadContent.offsetParent.style.zoom = '1.0';
        downloadContent.style.margin = '';
        downloadContent.style.padding = '';
        downloadContent.offsetParent.style.margin = '';
        downloadContent.offsetParent.style.width = '';
        downloadContent.offsetParent.style.height = ''
      } catch (e) {
        this.notify(this.SAVE_AS_PDF_FAIL, '', this.LogLevel.ERROR, true);
        throw e;
      }
    }
  ]
});
