foam.CLASS({
  package: 'net.nanopay.invoice.ui.history',
  name: 'InvoiceStatusHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice'
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
      margin-left: -6px;
    }
    ^ .statusBox {
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
      color: #093649;
    }
  `,

  methods: [
    function getAttributes(record) {
      var status = record.updates.find(u => u.name == 'status')

      if ( ! status ) status = { newValue: 'Scheduled' };

      switch ( status.newValue ) {
        case "Void":
          return {
            labelText: 'Void',
            labelDecoration: 'Invoice-Status-Void',
            icon: 'images/ic-void.svg'
          };

        case "Paid":
          return {
            labelText: 'Paid',
            labelDecoration: 'Invoice-Status-Paid',
            icon: 'images/ic-approve.svg'
          };

        case "Scheduled":
          return {
            labelText: 'Scheduled',
            labelDecoration: 'Invoice-Status-Scheduled',
            icon: 'images/ic-scheduled.svg'
          };

        case "Overdue":
          return {
            labelText: 'Overdue',
            labelDecoration: 'Invoice-Status-Overdue',
            icon: 'images/ic-overdue.svg'
          };
        case "Due":
          return {
            labelText: 'Due',
            labelDecoration: 'Invoice-Status-Due',
            icon: 'images/ic-scheduled.svg'
          };
      }
    },

    function formatDate(timestamp) {
      var locale = 'en-US';
      return timestamp.toLocaleTimeString(locale, { hour12: false }) +
        ' ' + timestamp.toLocaleString(locale, { month: 'short' }) +
        ' ' + timestamp.getDate() +
        ' ' + timestamp.getFullYear();
    },

    function outputRecord(parentView, record) {
      var self = this;
      var attributes = this.getAttributes(record);
      var displayDate = new Date(record.updates.find(u => u.name === 'paymentDate').newValue);

      return parentView
        .addClass(this.myClass())
        .style({ 'padding-left': '20px' })
        .start('div').addClass('iconPosition')
          .tag({ class: 'foam.u2.tag.Image', data: attributes.icon })
        .end()
        .start('div').addClass('statusBox')
          .start('div')
            .style({ 'padding-left': '30px' })
            .start('span').addClass('statusTitle')
              .add("Invoice has been marked as ", )
            .end()
            .start('div').addClass(attributes.labelDecoration)
              .start('span').add(attributes.labelText)
                .start('span').style({ 'margin-left' : '4px'})
                  .callIf(displayDate, function() {
                    this.add(self.formatDate(displayDate));
                  })
                .end()
              .end()
            .end()
          .end()
          .start('div')
            .style({ 'padding-left': '30px' })
            .start('span').addClass('statusDate')
              .add(this.formatDate(record.timestamp))
            .end()
          .end()
        .end()
    }
  ]
});