foam.CLASS({
  package: 'net.nanopay.invite.ui',
  name: 'InvitationItemView',
  extends: 'foam.u2.View',

  imports: [
    'userDAO'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.nanos.auth.Phone',
    'foam.u2.dialog.NotificationMessage'
  ],

  css: `
    ^ .invite-detail {
      width: 1240px;
    }
    ^ .table-header {
      height: 40px;
      background-color: rgba(110, 174, 195, 0.2);
      padding-bottom: 10px;
      margin: 0;
    }

    ^ th {
      height: 14px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 500;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.3px;
      color: #093649;
      text-align: left;
      padding: 0 20px 0 20px;
    }

    ^ .table-body {
      height: 60px;
      background-color: #ffffff;
      border: solid 0.5px #e9e9e9;
    }

    ^ td {
      height: 20px;
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.67;
      letter-spacing: 0.2px;
      color: #093649;
      text-align: left;
      padding: 0 20px 0 20px;
    }
  `,

  properties: [
    'data',
    {
      class: 'String',
      name: 'legalName',
      factory: function () {
        var user = this.data.user;
        return user.firstName + ' ' + user.lastName;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      var user = this.data.user;
      var phone = user.phone;

      this
        .addClass(this.myClass())
        .start('table').addClass('invite-detail')
          .start('tr').addClass('table-header')
            .start('th').add('ID').end()
            .start('th').add('Legal Name').end()
            .start('th').add('Email Address').end()
            .start('th').add('Phone Number').end()
            .start('th').add('Job Title').end()
            .start('th').add('Registered Business Name').end()
            .start('th').add('Compliance').end()
            .start('th').add('Type').end()
            .start('th').add('Status').end()
          .end()
          .start('tr').addClass('table-body')
            .start('td').add(this.data.id).end()
            .start('td').add(this.legalName$).end()
            .start('td').add(user.email$).end()
            .start('td').add(phone.number$).end()
            .start('td').add(user.jobTitle$).end()
            .start('td').add(user.businessName$).end()
            .start('td').add(this.data.complianceStatus.label).end()
            .start('td').add(user.type$).end()
            .start('td').add(this.data.inviteStatus.label).end()
          .end()
        .end()
    }
  ]
});