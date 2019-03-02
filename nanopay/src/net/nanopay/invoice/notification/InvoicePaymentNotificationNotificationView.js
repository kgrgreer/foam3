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
        .start(this.LINK).end();
    }
  ],

  actions: [
    {
      name: 'link',
      label: 'View Invoice',
      code: function() {
        var paymentMethod = this.data.invoice.paymentMethod;
        var linkView = paymentMethod === this.PaymentStatus.NANOPAY
            ? 'net.nanopay.invoice.ui.SalesDetailView'
            : 'net.nanopay.invoice.ui.ExpensesDetailView';
        this.stack.push({
          class: linkView,
          data: this.data.invoice
        }, this);
      }
    }
  ]
});
