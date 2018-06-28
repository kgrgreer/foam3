foam.CLASS({
  package: 'net.nanopay.invoice.notification',
  name: 'ReceivePaymentNotificationNotificationView',
  extends: 'foam.nanos.notification.NotificationView',

  imports: [
    'addCommas',
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

  methods: [
    function initE() {
      this.SUPER();
      var i = this.data;
      var self = this;
      this.invoiceDAO.find(i.invoiceId).then(function(result) {
        self.searchResult = result;
      });
      /*
        get sender's name from userDAO since result.payeeName and payerName
        are the empty strings for the first retrieval from invoiceDAO
      */
      this.userDAO.find(i.fromUserId).then(function(user) {
        self.name = user.label();
      });

      this.addClass(this.myClass())
      .start().addClass('msg')
        .add(this.name$)
        .add(` just paid your invoice #${i.invoiceNumber} of $${this.addCommas((i.amount/100).toFixed(2))}.`)
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
            data: this.searchResult
          }, this);
        }
    }
  ]


});
