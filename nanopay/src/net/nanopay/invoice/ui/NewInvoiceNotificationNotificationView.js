foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'NewInvoiceNotificationNotificationView',
  extends: 'foam.nanos.notification.NotificationView',

  imports: [
    'addCommas',
    'hideReceivableSummary',
    'invoiceDAO',
    'stack',
    'userDAO'
  ],

  exports: [
    'as data',
  ],

  properties: [
    'name',
    'searchResult'
  ],

  css: `
  ^ .message {
    margin-left: 20px;
  }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var i = this.data;
      var self = this;
      this.invoiceDAO.find(i.id).then(function(invoice) {
        self.searchResult = invoice;
        self.name = invoice.payer.label();
      });

      this.addClass(this.myClass())
      .start().addClass('message')
        .add(this.name$)
        .add(` just send you a ${i.invoiceType.toLowerCase()} invoice of $${this.addCommas((i.amount/100).toFixed(2))}.`)
      .end()
      .start(this.LINK).end();
    }
  ],

  actions: [{
    name: 'link',
    label: 'View Invoice',
    code: function() {
      if ( this.data.invoiceType === 'RECEIVABLE' ) {
        this.stack.push({
          class: 'net.nanopay.invoice.ui.SalesDetailView',
          data: this.searchResult
        }, this);
      } else {
        this.stack.push({
          class: 'net.nanopay.invoice.ui.ExpensesDetailView',
          data: this.searchResult
        }, this);
      }
    }
  }]
});
