foam.CLASS({
  package: 'net.nanopay.invoice.ui.history',
  name: 'InvoiceStatusHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView',
    'net.nanopay.invoice.util.InvoiceHistoryUtility'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  imports: [
    'invoiceDAO',
    'user',
    'agent'
  ],

  documentation: 'View for displaying history for invoice status',

  properties: [
    'paymentDate',
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
      height: 75px;
      margin-top: -15px;
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

    function formatDate(timestamp, displayTime=true) {
      var locale = 'en-US';
      var time = displayTime ? `${timestamp.toLocaleTimeString(locale, { hour12: false })}s ` : '';
      return time
        + `${timestamp.toLocaleString(locale, { month: 'short' })} `
        + `${timestamp.getDate()} `
        + timestamp.getFullYear();
    },

    async function outputRecord(parentView, record) {
      const attributes = this.getAttributes(record);

      // Only show updates to the status.
      if ( attributes === null ) return;

      const self = this;

      const paymentDateUpdate = record.updates.find((u) => u.name === 'paymentDate');
      const hasDisplayDate = paymentDateUpdate && paymentDateUpdate.newValue !== null;
      const displayDate = hasDisplayDate ? new Date(paymentDateUpdate.newValue) : null;

      const invoice = await this.invoiceDAO.find(record.objectId);

      this.name = this.getDisplayName(record, this.user, invoice);

      const payee = invoice.payee.id === this.user.id ? this.name : invoice.payee.toSummary();
      // a flag for checking if the invoice was completed by the payee
      const completedByPayee = invoice.paymentMethod === this.PaymentStatus.CHEQUE;
      // a flag for checking if the invoice was edited by employee
      const emplyeeChanges = attributes.labelText === this.InvoiceStatus.PENDING_APPROVAL.label;
      // a flag for checking if the invoice was marked as void
      const markAsVoid = attributes.labelText === this.InvoiceStatus.VOID.label;

      return parentView
        .addClass(this.myClass())
        .style({ 'padding-left': '20px' })
        .start('div').addClass('iconPosition')
        .end()
        .start('div').addClass('statusBox')
          .start('div')
            .style({ 'padding-left': '30px' })
            .start('span').addClass('statusTitle')
              .callIf(completedByPayee, function() {
                this.add(`${payee} marked invoice as `);
              })
              .callIf(emplyeeChanges, function() {
                this.add(` ${self.name} send invoice for approval `);
              })
              .callIf( markAsVoid, function() {
                this.add(`${self.name} marks invoice as `);
              })
              .callIf( ! completedByPayee && ! emplyeeChanges && ! markAsVoid, function() {
                this.add('Invoice status changed to ');
              })
            .end()
            .callIf( ! emplyeeChanges, function() {
              this.start('span')
                .add(attributes.labelText)
              .end()
            })
            .callIf(hasDisplayDate &&
              (attributes.labelText === 'Scheduled' || completedByPayee),
              function() {
                this.start('span').addClass('statusTitle')
                  .add(` on ${self.formatDate(displayDate, false)}`)
                .end();
            })
          .end()
          .start('div')
            .style({ 'padding-left': '30px' })
            .start('span').addClass('statusDate')
              .add(this.formatDate(record.timestamp))
            .end()
          .end()
        .end();
    }
  ]
});
