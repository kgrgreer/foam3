foam.CLASS({
  package: 'net.nanopay.accounting',
  name: 'AccountingIntegrationUtil',

  requires: [
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.AccountingErrorCodes',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.xero.model.XeroInvoice',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice',
  ],

  imports: [
    'contactDAO',
    'ctrl',
    'invoiceDAO',
    'quickbooksService',
    'userDAO',
    'xeroService',
    'user'
  ],

  properties: [

  ],

  methods: [
    async function forceSyncInvoice(invoice) {
      let service = null;
      if ( this.XeroInvoice.isInstance(invoice) && this.user.id == invoice.createdBy &&(invoice.status == this.InvoiceStatus.UNPAID || invoice.status == this.InvoiceStatus.OVERDUE) ) {
        if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
          service = this.xeroService;
        } else {
          this.ctrl.notify(' Cannot sync invoice, Not signed into Xero.', 'error');
          return null;
        }
      } else if ( this.QuickbooksInvoice.isInstance(invoice) && this.user.id == invoice.createdBy &&(invoice.status == this.InvoiceStatus.UNPAID || invoice.status == this.InvoiceStatus.OVERDUE) ) {
        if ( this.user.integrationCode == this.IntegrationCode.QUICKBOOKS ) {
          service = this.quickbooksService;
        } else {
          this.ctrl.notify(' Cannot sync invoice, Not signed into Quickbooks.', 'error');
          return null;
        }
      }

      if ( service != null ) {
        let result = await service.singleSync(null, invoice);
        if ( ! result.result ) {
          if ( result.errorCode === this.AccountingErrorCodes.TOKEN_EXPIRED ) {
            this.ctrl.add(this.Popup.create({ closeable: false }).tag({
              class: 'net.nanopay.accounting.AccountingTimeOutModal'
            }));
          } else {
            this.ctrl.notify(result.reason, 'error');
          }
          return null;
        }
        return await this.invoiceDAO.find(invoice);
      } else if ( service == null ) {
        return invoice;
      }
    }
  ]
});
