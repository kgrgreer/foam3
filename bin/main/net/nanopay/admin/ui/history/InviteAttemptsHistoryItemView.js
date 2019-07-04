foam.CLASS({
  package: 'net.nanopay.admin.ui.history',
  name: 'InviteAttemptsHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  documentation: 'View for displaying history for invitation attempts',

  css: `
    ^ .iconPosition {
      margin-left: -6px;
    }
    ^ .statusBox {
      margin-top: -20px;
      padding-bottom: 22px;
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
    function formatDate(timestamp) {
      var locale = 'en-US';
      return timestamp.toLocaleTimeString(locale, { hour12: false }) +
        ' ' + timestamp.toLocaleString(locale, { month: 'short' }) +
        ' ' + timestamp.getDate() +
        ' ' + timestamp.getFullYear();
    },

    function outputRecord(parentView, record) {
      var inviteAttempts = record.updates.find(u => u.name == 'inviteAttempts' );
      var attempts = inviteAttempts.newValue || 0;

      if ( attempts > 1 ) {
        return parentView
          .addClass(this.myClass())
          .style({ 'padding-left': '20px' })
          .start('div').addClass('iconPosition')
            .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-sent.svg' })
          .end()
          .start('div').addClass('statusBox')
            .start('div')
              .style({ 'padding-left': '30px' })
              .start('span').addClass('statusTitle')
                .add('Invite resent')
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
    }
  ]
});