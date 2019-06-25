foam.CLASS({
  package: 'net.nanopay.admin.ui.history',
  name: 'AccountStatusHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  requires: [
    'net.nanopay.admin.model.AccountStatus'
  ],

  documentation: 'View for displaying history for invitation status',

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
      color: /*%BLACK%*/ #1e1f21;
    }
  `,

  methods: [
    function getAttributes(record) {
      var status = record.updates.find(u => u.name == 'status') ||
        { newValue: this.AccountStatus.PENDING };

      switch ( status.newValue ) {
        case this.AccountStatus.PENDING:
          return {
            title: 'Account',
            labelText: 'Pending',
            labelDecoration: 'Invite-Status-Pending',
            icon: 'images/ic-created.svg'
          };

        case this.AccountStatus.SUBMITTED:
          return {
            title: 'Registration',
            labelText: 'Submitted',
            labelDecoration: 'Invite-Status-Submitted',
            icon: 'images/ic-received.svg'
          };

        case this.AccountStatus.ACTIVE:
          return {
            title: 'Account',
            labelText: 'Active',
            labelDecoration: 'Invite-Status-Active',
            icon: 'images/ic-approve.svg'
          };

        case this.AccountStatus.DISABLED:
          return {
            title: 'Account',
            labelText: 'Disabled',
            labelDecoration: 'Invite-Status-Disabled',
            icon: 'images/ic-void.svg'
          };
        case this.AccountStatus.REVOKED:
          return {
            title: 'Invite',
            labelText: 'Revoked',
            labelDecoration: 'Invite-Status-Pending',
            icon: 'images/ic-void.svg'
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
      var attributes = this.getAttributes(record);

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
              .add(attributes.title)
            .end()
            .start('div').addClass(attributes.labelDecoration)
              .start('span').add(attributes.labelText).end()
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