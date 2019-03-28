foam.CLASS({
  package: 'net.nanopay.accounting',
  name: 'AccountingIntegrationUtil',

  documentation: 'Manages the front-end common logic for Accounting Integrations',

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

  exports: [
    'showIntegrationModal'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'showIntegrationModal'
    }
  ],

  methods: [
    async function forceSyncInvoice(invoice) {
      this.showIntegrationModal = false;
      let service = null;
      let accountingSoftwareName = null;
      if ( this.XeroInvoice.isInstance(invoice) && this.user.id == invoice.createdBy &&(invoice.status == this.InvoiceStatus.UNPAID || invoice.status == this.InvoiceStatus.OVERDUE) ) {
        service = this.xeroService;
        accountingSoftwareName = 'Xero';
      } else if ( this.QuickbooksInvoice.isInstance(invoice) && this.user.id == invoice.createdBy &&(invoice.status == this.InvoiceStatus.UNPAID || invoice.status == this.InvoiceStatus.OVERDUE) ) {
        service = this.quickbooksService;
        accountingSoftwareName = 'Quickbooks';
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
            this.ctrl.notify(result.reason, 'error');
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
        this.ctrl.add(this.Popup.create().tag({
          class: 'net.invoice.ui.modal.IntegrationModal'
        }));
      }
    }
  ]
});
