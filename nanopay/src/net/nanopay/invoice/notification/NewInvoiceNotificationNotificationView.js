foam.CLASS({
  package: 'net.nanopay.invoice.notification',
  name: 'NewInvoiceNotificationNotificationView',
  extends: 'foam.nanos.notification.NotificationView',

  requires: [
    'net.nanopay.invoice.notification.InvoiceNotificationType'
  ],

  imports: [
    'addCommas',
    'invoiceDAO',
    'stack'
  ],

  exports: [
    'as data',
  ],

  properties: [
    'invoice',
    'message'
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;
      this.invoiceDAO.find(this.data.invoiceId).then(function(result) {
        self.invoice = result;
        if ( self.invoice == null ) {
          self.message = 'The invoice for this notification can no longer be found.';
        } else {
          var senderName = self.invoice.payeeId !== self.invoice.createdBy
              ? self.invoice.payer.label()
              : self.invoice.payee.label();
          var invoiceType = self.getInvoiceNotificationType(self.invoice);
          var amount = self.addCommas((self.invoice.amount / 100).toFixed(2));
          self.message = `${senderName} just sent you a ${invoiceType.label} invoice
              of $${amount}.`;
        }
      });
      this
        .addClass(this.myClass())
        .start()
          .addClass('msg')
          .add(this.message$)
        .end()
        .start(this.LINK).end();
    },
    function getInvoiceNotificationType(invoice) {
      return invoice.payeeId === invoice.createdBy
          ? this.InvoiceNotificationType.PAYABLE
          : this.InvoiceNotificationType.RECEIVABLE;
    }
  ],

  actions: [{
    name: 'link',
    label: 'View Invoice',
    isEnabled: function(invoice) {
      return invoice != null;
    },
    code: function() {
      if ( this.getInvoiceNotificationType(this.invoice)
          === this.InvoiceNotificationType.RECEIVABLE ) {
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
