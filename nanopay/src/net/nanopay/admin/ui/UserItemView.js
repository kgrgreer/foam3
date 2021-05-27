/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'UserItemView',
  extends: 'foam.u2.View',

  requires: [
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.admin.model.AccountStatus'
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
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.3px;
      color: /*%BLACK%*/ #1e1f21;
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
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.67;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
      text-align: left;
      padding: 0 20px 0 20px;
    }
    ^ .Compliance-Status-Requested {
      margin: 20px 5px 20px 5px;
    }
    ^ .Compliance-Status-Passed {
      margin: 20px 5px 20px 5px;
    }
    ^ .Compliance-Status-Failed {
      margin: 20px 5px 20px 5px;
    }
    ^ .Invite-Status-Pending {
      margin: 20px 5px 20px 5px;
    }
    ^ .Invite-Status-Submitted {
      margin: 20px 5px 20px 5px;
    }
    ^ .Invite-Status-Active {
      margin: 20px 5px 20px 5px;
    }
    ^ .Invite-Status-Disabled {
      margin: 20px 5px 20px 5px;
    }
  `,

  properties: [
    'data'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

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
            .start('td').add(this.data.id$).end()
            .start('td').add(this.data.legalName$).end()
            .start('td').add(this.data.email$).end()
            .start('td').add(this.data.phoneNumber$).end()
            .start('td').add(this.data.jobTitle$).end()
            .start('td').add(this.data.businessName$).end()
            .start('td')
              .addClass(this.data.compliance$.map(function (status) {
                switch ( status ) {
                  case self.ComplianceStatus.REQUESTED:
                    return 'Compliance-Status-Requested';
                  case self.ComplianceStatus.PASSED:
                    return 'Compliance-Status-Passed';
                  case self.ComplianceStatus.FAILED:
                    return 'Compliance-Status-Failed';
                }
              }))
              .add(this.data.compliance$.map(function (status) {
                return status.label;
              }))
            .end()
            .start('td').add(this.data.type$).end()
            .start('td')
              .addClass(this.data.status$.map(function (status) {
                switch ( status ) {
                  case self.AccountStatus.PENDING:
                    return 'Invite-Status-Pending'
                  case self.AccountStatus.SUBMITTED:
                    return 'Invite-Status-Submitted'
                  case self.AccountStatus.ACTIVE:
                    return 'Invite-Status-Active'
                  case self.AccountStatus.DISABLED:
                  case self.AccountStatus.REVOKED:
                    return 'Invite-Status-Disabled'
                }
              }))
              .add(this.data.status$.map(function (status) {
                return status.label;
              }))
            .end()
          .end()
        .end()
    }
  ]
});
