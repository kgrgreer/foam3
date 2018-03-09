foam.CLASS({
  package: 'net.nanopay.ui.history',
  name: 'InvoiceHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  documentation: 'View displaying history invoice item',

  css: `
    ^ statusDate {
      font-family: Roboto;
      font-size: 8px;
      line-height: 1.33;
      letter-spacing: 0.1px;
      color: #a4b3b8;
      top: 5px;
      position: relative;
    }

    ^ statusTitle {
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      color: #093649;
    }

    ^ statusBox {
      margin-top: -17px;
      padding-bottom: 22px;
    }

    ^ statusContent {
      padding-left: 40px;
    }

    ^ messageText {
      opacity: 0.7;
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      color: #093649;
      position: relative;
    }

    ^ messageBox {
      width: 513px;
      border-radius: 2px;
      background-color: #ffffff;
      border: solid 0.5px #a4b3b8;
      margin: 10px 0px 0px 31px;
      padding: 10px;
    }

    ^ statusDate {
      font-family: Roboto;
      font-size: 8px;
      line-height: 1.33;
      letter-spacing: 0.1px;
      color: #a4b3b8;
      top: 5px;
      position: relative;
    }

    .Invoice-Status-Paid {
      background-color: #2cab70;
    }

    .Invoice-Status-Received {
      font-weight: bold;
      margin-left: 0px !important;
      display: inline;
    }

    ^ iconPosition {
      margin-left: -6px;
    }

    ^ scheduledDate {
      opacity: 0.6;
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.67;
      letter-spacing: 0.2px;
      color: #000000;
      margin-left: 5px;
    }
  `,

  // TODO: Extract to shared location, being repeated multiple
  // times throughout b2b
  messages: [
    { name: 'paidLabel',       message: 'Paid' },
    { name: 'overdueLabel',    message: 'Overdue' },
    { name: 'dueLabel',        message: 'Due' },
    { name: 'scheduledLabel',  message: 'Scheduled' },
    { name: 'disputeLabel',    message: 'Disputed' },
    { name: 'pendingLabel',    message: 'Pending Approval' },
    { name: 'draftLabel',      message: 'Draft' }
  ],

  methods: [
    function getAttributes(record) {
      var statusChange = record.updates.find((u) => u.name == "Invoice Status");

      switch ( statusChange.newValue ) {
        case 'Paid':
          return {
            title: 'Invoice has been',
            labelDecoration: 'Invoice-Status-Paid',
            labelText: statusChange.newValue,
            icon: 'images/ic-approve.svg',
            anonymous: true
          };
        case 'Scheduled':
          return {
            title: 'Invoice has been marked as',
            labelDecoration: 'Invoice-Status-Scheduled',
            labelText: statusChange.newValue,
            icon: 'images/ic-scheduled.svg'
          };
        case 'Disputed':
          return {
            title: 'Invoice has been marked as',
            labelDecoration: 'Invoice-Status-Disputed',
            labelText: statusChange.newValue,
            icon: 'images/ic-dispute.svg'
          };
        case 'Pending Approval':
          return {
            title: 'Invoice has been marked as',
            labelDecoration: 'Invoice-Status-Pending-Approval',
            labelText: statusChange.newValue,
            icon: 'images/ic-pending.svg'
          };
        case 'Received':
          return {
            title: 'Invoice received from ',
            labelDecoration: 'Invoice-Status-Received',
            labelText: record.updates.find((u) => u.name == "From").newValue,
            icon: 'images/ic-received.svg',
            anonymous: true
          };
        default:
          return {
            title: 'Invoice has been marked as',
            labelDecoration: 'Invoice-Status-Pending-Approval',
            labelText: statusChange.newValue,
            icon: 'images/ic-pending.svg'
          };
      }
    },

    // Returns the formatted date per spec:
    // Ex. 16:08:01 Hrs, 25 April 2017
    function formatDate(timestamp) {
      var locale = 'en-US';

      return timestamp.toLocaleTimeString(locale, { hour12: false })
        + ' Hrs, ' + timestamp.getDate() +
        ' ' + timestamp.toLocaleString(locale, { month: 'long' }) +
        ' ' + timestamp.getFullYear();
    },

    function outputRecord(parentView, record) {
      var view = this;

      var message = record.updates.find(u => u.name == "Message");
      var scheduledDate = record.updates.find(u => u.name == "Scheduled Date");
      var attributes = view.getAttributes(record);

      return parentView
          .style({'padding-left': '20px'})
          .start('div')
              .tag({class: 'foam.u2.tag.Image', data: attributes.icon})
              .addClass( view.myClass('iconPosition'))
          .end()
          .start('div').addClass(view.myClass('statusBox'))
              .start('div')
                  .style({'padding-left': '30px'})
                  .start('span')
                      .add(attributes.title)
                      .addClass(view.myClass('statusTitle'))
                  .end()
                  .start('div')
                      .style({'margin-left': '5px'})
                      .addClass(attributes.labelDecoration)
                      .add(attributes.labelText)
                  .end()
                  .call(function() {
                      if (scheduledDate) {
                          this.start('span')
                              .add(scheduledDate.newValue)
                              .addClass(view.myClass('scheduledDate'))
                          .end()
                      }
                  })
              .end()
              .call(function() {
                  if (message) {
                      this.start('div')
                          .addClass(view.myClass('messageBox'))
                          .start('span')
                              .add(message.newValue)
                              .addClass(view.myClass('messageText'))
                          .end()
                      .end();
                  }
              })
              .start('div')
                  .style({'padding-left': '30px'})
                  .start('span')
                      .add(view.formatDate(record.timestamp) +
                      (attributes.anonymous ? '' : ' by ' + record.user.split(' ')[1]))
                      .addClass(view.myClass('statusDate'))
                  .end()
              .end()
          .end()
    }
  ]
});
