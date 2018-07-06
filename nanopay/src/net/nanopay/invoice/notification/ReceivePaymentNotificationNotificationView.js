foam.CLASS({
  package: 'net.nanopay.invoice.notification',
  name: 'ReceivePaymentNotificationNotificationView',
  extends: 'foam.nanos.notification.NotificationView',

  imports: [
    'addCommas',
    'stack',
    'userDAO'
  ],

  exports: [
    'as data',
  ],

  methods: [
    function initE() {
      this.SUPER();
      var invoice = this.data.invoice;

      this.addClass(this.myClass())
      .start().addClass('msg')
        .add(`${invoice.payer.label()} just paid your invoice #${invoice.invoiceNumber} of $
            ${this.addCommas((invoice.amount/100).toFixed(2))}.`)
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
          data: this.data.invoice
        }, this);
      }
    }
  ]

});
