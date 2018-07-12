foam.CLASS({
  package: 'net.nanopay.invoice.notification',
  name: 'NewInvoiceNotificationNotificationView',
  extends: 'foam.nanos.notification.NotificationView',

  requires: [
    'net.nanopay.invoice.notification.InvoiceNotificationType'
  ],

  imports: [
    'addCommas',
    'hideReceivableSummary',
    'invoiceDAO',
    'stack'
  ],

  exports: [
    'as data',
  ],

  properties: [
    'invoice'
  ],

  methods: [
    async function initE() {
      this.SUPER();
      this.invoice = await this.invoiceDAO.find(this.data.invoiceId);
      var senderName = this.invoice.payeeId !== this.invoice.createdBy
        ? this.invoice.payer.label() : this.invoice.payee.label();

      this.addClass(this.myClass())
      .start().addClass('msg')
        .add(`${senderName} just sent you a ${this.getInvoiceNotificationType().label} 
            invoice of $${this.addCommas((this.invoice.amount/100).toFixed(2))}.`)
      .end()
      .start(this.LINK).end();
    },
    function getInvoiceNotificationType() {
      /* if invoice.payeeId is equal to invoice.createdBy
         for notification receiver, it is payable invoice
         for notification sender, it is receivable invoice
      */ 
      return this.invoice.payeeId === this.invoice.createdBy
        ? this.InvoiceNotificationType.PAYABLE: this.InvoiceNotificationType.RECEIVABLE;
    }
  ],

  actions: [{
    name: 'link',
    label: 'View Invoice',
    code: function() {
      if ( this.getInvoiceNotificationType() === this.InvoiceNotificationType.RECEIVABLE ) {
        this.stack.push({
          class: 'net.nanopay.invoice.ui.SalesDetailView',
          data: this.invoice
        }, this);
      } else {
        this.stack.push({
          class: 'net.nanopay.invoice.ui.ExpensesDetailView',
          data: this.invoice
        }, this);
      }
    }
  }]
});
