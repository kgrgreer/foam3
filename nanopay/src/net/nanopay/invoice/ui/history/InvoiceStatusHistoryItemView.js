foam.CLASS({
  package: 'net.nanopay.invoice.ui.history',
  name: 'InvoiceStatusHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  imports: [
    'invoiceDAO'
  ],

  documentation: 'View for displaying history for invoice status',

  properties: [
    'paymentDate'
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
    function getAttributes(record) {
      var status = record.updates.find((u) => u.name === 'status');

      if ( status === undefined ) return null;

      switch ( status.newValue ) {
        case this.InvoiceStatus.VOID:
          return {
            labelText: this.InvoiceStatus.VOID.label,
            labelDecoration: 'Invoice-Status-Void',
            icon: 'images/ic-void.svg'
          };
        case this.InvoiceStatus.FAILED:
          return {
            labelText: this.InvoiceStatus.FAILED.label,
            labelDecoration: 'Invoice-Status-Void',
            icon: 'images/ic-void.svg'
          };
        case this.InvoiceStatus.PROCESSING:
          return {
            labelText: this.InvoiceStatus.PROCESSING.label,
            labelDecoration: 'Invoice-Status-Processing',
            icon: 'images/ic-pending.svg',
          };
        case this.InvoiceStatus.PAID:
          return {
            labelText: this.InvoiceStatus.PAID.label,
            labelDecoration: 'Invoice-Status-Paid',
            icon: 'images/ic-approve.svg'
          };
        case this.InvoiceStatus.SCHEDULED:
          return {
            labelText: this.InvoiceStatus.SCHEDULED.label,
            labelDecoration: 'Invoice-Status-Scheduled',
            icon: 'images/ic-scheduled.svg'
          };
        case this.InvoiceStatus.OVERDUE:
          return {
            labelText: this.InvoiceStatus.OVERDUE.label,
            labelDecoration: 'Invoice-Status-Overdue',
            icon: 'images/ic-overdue.svg'
          };
        case this.InvoiceStatus.UNPAID:
          return {
            labelText: this.InvoiceStatus.UNPAID.label,
            labelDecoration: 'Invoice-Status-Unpaid',
            icon: 'images/ic-scheduled.svg'
          };
        case this.InvoiceStatus.PENDING_APPROVAL:
          var user = ctrl.user;
          var currentUser = `${user.lastName}, ${user.firstName}(${user.id})`;
          if ( record.user === currentUser ) {
            return {
              labelText: this.InvoiceStatus.PENDING_APPROVAL.label,
              labelDecoration: 'Invoice-Status-Pending-approval',
              icon: 'images/ic-scheduled.svg'
            };
          } else return null;
        case this.InvoiceStatus.PENDING_ACCEPTANCE:
          return {
            labelText: this.InvoiceStatus.PENDING_ACCEPTANCE.label,
            labelDecoration: 'Invoice-Status-Pending-approval',
            icon: 'images/ic-scheduled.svg'
          };
        case this.InvoiceStatus.DEPOSITING_MONEY:
          return {
            labelText: this.InvoiceStatus.DEPOSITING_MONEY.label,
            labelDecoration: 'Invoice-Status-Pending-approval',
            icon: 'images/ic-scheduled.svg'
          };
      }
    },

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
      // name of the payee
      const payee = await invoice.payee.label();
      // a flag for checking if the invoice was completed by the payee
      const completedByPayee = invoice.paymentMethod === this.PaymentStatus.CHEQUE;

      return parentView
        .addClass(this.myClass())
        .style({ 'padding-left': '20px' })
        .start('div').addClass('iconPosition')
        .end()
        .start('div').addClass('statusBox')
          .start('div')
            .style({ 'padding-left': '30px' })
            .start('span').addClass('statusTitle')
              .callIfElse(completedByPayee, function() {
                this.add(`${payee} marked invoice as `);
              }, function() {
                this.add('Invoice status changed to ');
              })
            .end()
            .start('span')
              .add(attributes.labelText)
            .end()
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
