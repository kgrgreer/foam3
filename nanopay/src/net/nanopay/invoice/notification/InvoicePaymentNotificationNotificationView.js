foam.CLASS({
  package: 'net.nanopay.invoice.notification',
  name: 'InvoicePaymentNotificationNotificationView',
  extends: 'foam.nanos.notification.NotificationView',

  requires: [
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  imports: [
    'addCommas',
    'stack'
  ],

  exports: [
    'as data',
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .addClass('msg')
          .add(this.data.message)
        .end()
        .start(this.LINK).end();
    }
  ],

  actions: [
    {
      name: 'link',
      label: 'View Invoice',
      code: function() {
        if ( this.data.invoice.paymentMethod === this.PaymentStatus.NANOPAY ) {
          this.stack.push({
            class: 'net.nanopay.invoice.ui.SalesDetailView',
            data: this.data.invoice
          }, this);
        } else if ( this.data.invoice.paymentMethod
              === this.PaymentStatus.CHEQUE ) {
          this.stack.push({
            class: 'net.nanopay.invoice.ui.ExpensesDetailView',
            data: this.data.invoice
          }, this);
        }
      }
    }
  ]
});
