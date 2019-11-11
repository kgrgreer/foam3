/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.ticket',
  name: 'SudoTicket',
  extends: 'foam.nanos.ticket.Ticket',

  javaImports: [
    'net.nanopay.approval.ApprovalStatus',
    'java.util.Calendar',
    'java.util.Date'
  ],

  properties: [
    {
      name: 'sudoAsUser',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      required: true,
      section: 'basicInfo',
      validationPredicates: [
        {
          args: ['sudoAsUser'],
          predicateFactory: function(e) {
            return e.GT(net.nanopay.ticket.SudoTicket.SUDO_AS_USER, 0);
          },
          errorString: 'Please select a user.'
        }
      ]
    },
    {
      name: 'expiry',
      class: 'DateTime',
      factory: function() {
        var dt = new Date();
        dt.setHours( dt.getHours() + 4 );
        return dt;
      },
      javaFactory: `
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.HOUR_OF_DAY, 4);
        return cal.getTime();
      `,
      section: 'basicInfo'
    },
    {
      name: 'approvalStatus',
      class: 'foam.core.Enum',
      of: 'net.nanopay.approval.ApprovalStatus',
      value: 'REQUESTED',
      visibility: 'RO',
      section: 'basicInfo'
    },
    {
      name: 'savedGroup',
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      hidden: true
    },
    {
      name: 'title',
      required: false,
      hidden: true
    },
    {
      name: 'summary',
      tableCellFormatter: function(value, obj) {
        // TODO: get user name.
        this.add(getOwner()+' sudo as '+getSudoAsUser());
      }
    }
  ],
});
