foam.CLASS({
  package: 'net.nanopay.invoice.notification',
  name: 'RecordPaymentNotificationNotificationView',
  extends: 'foam.nanos.notification.NotificationView',

  imports: [
    'addCommas',
    'stack',
    'userDAO'
  ],

  exports: [
    'as data',
  ],

  properties: [
    'name'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var invoice = this.data.invoice;
      var self = this;

      // get payee's name from userDAO since invoice.payeeName is empty
      this.userDAO.find(invoice.payeeId).then(function(user) {
        self.name = user.label();
      });

      this.addClass(this.myClass())
      .start().addClass('msg')
        .add(this.name$)
        .add(` has marked your invoice #${invoice.invoiceNumber} of $
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
          class: 'net.nanopay.invoice.ui.ExpensesDetailView',
          data: this.data.invoice
        }, this);
      }
    }
  ]
});
