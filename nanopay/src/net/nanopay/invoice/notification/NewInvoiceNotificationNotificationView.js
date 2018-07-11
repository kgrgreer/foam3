foam.CLASS({
  package: 'net.nanopay.invoice.notification',
  name: 'NewInvoiceNotificationNotificationView',
  extends: 'foam.nanos.notification.NotificationView',

  requires: ['net.nanopay.invoice.notification.InvoiceType'],

  imports: [
    'addCommas',
    'hideReceivableSummary',
    'stack'
  ],

  exports: [
    'as data',
  ],

  methods: [
    function initE() {
      this.SUPER();
      var invoice = this.data.invoice;
      var senderName = invoice.payeeId != invoice.createdBy
          ? invoice.payer.label() : invoice.payee.label();

      this.addClass(this.myClass())
      .start().addClass('msg')
        .add(`${senderName} just sent you a ${this.getInvoiceType().label} invoice of $
            ${this.addCommas((invoice.amount/100).toFixed(2))}.`)
      .end()
      .start(this.LINK).end();
    },
    function getInvoiceType() {
      var invoice = this.data.invoice;
      // invoice.payeeId == invoice.createdBy
      // for notification receiver, it is payable
      // for notification sender, it is receivable
      return invoice.payeeId == invoice.createdBy
          ? this.InvoiceType.PAYABLE: this.InvoiceType.RECEIVABLE;
    }
  ],

  actions: [{
    name: 'link',
    label: 'View Invoice',
    code: function() {
      if ( this.getInvoiceType() === this.InvoiceType.RECEIVABLE ) {
        this.stack.push({
          class: 'net.nanopay.invoice.ui.SalesDetailView',
          data: this.data.invoice
        }, this);
      } else {
        this.stack.push({
          class: 'net.nanopay.invoice.ui.ExpensesDetailView',
          data: this.data.invoice
        }, this);
      }
    }
  }]
});
