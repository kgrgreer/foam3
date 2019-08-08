foam.CLASS({
  package: 'net.nanopay.invoice.ui.history',
  name: 'InvoiceCreatedHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice'
  ],

  documentation: 'View for displaying create date and received company on invoice history',

  imports: [
    'invoiceDAO',
    'userDAO'
  ],

  properties: [
    'name'
  ],

  css: `
    ^ .iconPosition {
      width: 10px;
      height: 10px;
      border-radius: 50px;
      background-color: #2e227f;
      margin-left: -1px;
    }
    ^ .statusBox {
      height: 100px;
      margin-top: -20px;
      padding-bottom: 22px;
    }
    ^ .statusContent {
      padding-left: 40px;
    }
    ^ .statusDate {
      font-family: Roboto;
      font-size: 8px;
      line-height: 1.33;
      letter-spacing: 0.1px;
      color: #a4b3b8;
      top: 5px;
      position: relative;
    }
    ^ .statusTitle {
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
    }
  `,

  methods: [
    async function outputRecord(parentView, record) {
      var self = this;
      var invoice = await this.invoiceDAO.find(record.objectId);
      var user = invoice.createdBy === invoice.payer.id ?
        invoice.payer :
        invoice.payee;
      this.name = user.label();

      return parentView
        .addClass(this.myClass())
        .style({ 'padding-left': '20px' })
        .start('div').addClass('iconPosition')
        .end()
        .start('div').addClass('statusBox')
          .start('div')
            .style({ 'padding-left': '30px' })
            .start('span').addClass('statusTitle')
              .add('Invoice was created')
            .end()
          .end()
          .start('div')
            .style({ 'padding-left': '30px' })
            .start('span').addClass('statusDate')
              .add(this.formatDate(record.timestamp), ' by ', self.name)
            .end()
          .end()
        .end();
    },

    function formatDate(timestamp) {
      var locale = 'en-US';
      return timestamp.toLocaleTimeString(locale, { hour12: false }) +
        ' ' + timestamp.toLocaleString(locale, { month: 'short' }) +
        ' ' + timestamp.getDate() +
        ', ' + timestamp.getFullYear();
    }
  ]
});
