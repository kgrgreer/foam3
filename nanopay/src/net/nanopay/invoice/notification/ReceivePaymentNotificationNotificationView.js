foam.CLASS({
  package: 'net.nanopay.invoice.notification',
  name: 'ReceivePaymentNotificationNotificationView',
  extends: 'foam.nanos.notification.NotificationView',

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
        var senderName = self.invoice.payer.label();
        var invoiceNumber = self.invoice.invoiceNumber;
        var amount = self.addCommas((self.invoice.amount/100).toFixed(2));
        self.message = `${senderName} just paid your invoice #${invoiceNumber} of $${amount}.`;
      });

      this
        .addClass(this.myClass())
        .start()
          .addClass('msg')
          .add(this.message$)
        .end()
        .start(this.LINK).end();
    }
  ],

  actions: [
    {
      name: 'link',
      label: 'View Invoice',
      code: function() {
        this.stack.push({
          class: 'net.nanopay.invoice.ui.SalesDetailView',
          data: this.invoice
        }, this);
      }
    }
  ]

});
