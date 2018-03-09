foam.CLASS({
  package: 'net.nanopay.invite.ui',
  name: 'ComplianceStatusHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  requires: [
    'net.nanopay.invite.model.ComplianceStatus'
  ],

  documentation: 'View for displaying history for compliance status',

  css: `
    ^ .iconPosition {
      margin-left: -6px;
    }
    ^ .messageBox {
      width: 513px;
      border-radius: 2px;
      background-color: #ffffff;
      border: solid 0.5px #a4b3b8;
      margin: 10px 0px 0px 31px;
      padding: 10px;
    }
    ^ .messageText {
      opacity: 0.7;
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      color: #093649;
      position: relative;
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

    ^ .Compliance-Status-Requested {
      margin-left: 5px;
      width: 77px;
      height: 20px;
      border-radius: 100px;
      background-color: #59a5d5;
      display: inline-block;
    }
    ^ .Compliance-Status-Requested span {
      width: 59px;
      height: 20px;
      font-size: 12px;
      line-height: 1.67;
      letter-spacing: 0.2px;
      color: #ffffff;
      padding: 0 10px 0 10px;
    }

    ^ .Compliance-Status-Passed {
      margin-left: 5px;
      width: 62px;
      height: 20px;
      border-radius: 100px;
      background-color: #1cc2b7;
      display: inline-block;
    }
    ^ .Compliance-Status-Passed span {
      width: 42px;
      height: 20px;
      font-size: 12px;
      line-height: 1.67;
      letter-spacing: 0.2px;
      color: #ffffff;
      padding: 0 10px 0 10px;
    }

    ^ .Compliance-Status-Failed {
      margin-left: 5px;
      width: 53px;
      height: 20px;
      border-radius: 100px;
      background-color: #d81e05;
      display: inline-block;
    }
    ^ .Compliance-Status-Failed span {
      width: 34px;
      height: 20px;
      font-size: 12px;
      line-height: 1.67;
      letter-spacing: 0.2px;
      color: #ffffff;
      padding: 0 10px 0 10px;
    }
  `,

  methods: [
    function getAttributes(record) {
      var status = record.updates.find(u => u.name == 'complianceStatus') ||
        { newValue: this.ComplianceStatus.REQUESTED.ordinal };

      switch ( status.newValue ) {
        case this.ComplianceStatus.REQUESTED.ordinal:
          return {
            title: 'Compliance check',
            labelText: 'Requested',
            labelDecoration: 'Compliance-Status-Requested',
            icon: 'images/ic-pending.svg'
          };

        case this.ComplianceStatus.PASSED.ordinal:
          return {
            title: 'Compliance check',
            labelText: 'Passed',
            labelDecoration: 'Compliance-Status-Passed',
            icon: 'images/ic-compliance.svg'
          };

        case this.ComplianceStatus.FAILED.ordinal:
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
        .style({' padding-left': '20px' })
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
