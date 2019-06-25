foam.CLASS({
  package: 'net.nanopay.admin.ui.history',
  name: 'ComplianceStatusHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  requires: [
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  documentation: 'View for displaying history for compliance status',

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
      var status = record.updates.find(u => u.name == 'compliance') ||
        { newValue: this.ComplianceStatus.REQUESTED };

      switch ( status.newValue ) {
        case this.ComplianceStatus.REQUESTED:
          return {
            title: 'Compliance check',
            labelText: 'Requested',
            labelDecoration: 'Compliance-Status-Requested',
            icon: 'images/ic-pending.svg'
          };

        case this.ComplianceStatus.PASSED:
          return {
            title: 'Compliance check',
            labelText: 'Passed',
            labelDecoration: 'Compliance-Status-Passed',
            icon: 'images/ic-compliance.svg'
          };

        case this.ComplianceStatus.FAILED:
          return {
            title: 'Compliance check',
            labelText: 'Failed',
            labelDecoration: 'Compliance-Status-Failed',
            icon: 'images/ic-overdue.svg'
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
