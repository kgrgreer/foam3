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
    'foam.nanos.approval.ApprovalStatus',
    'java.util.Calendar',
    'java.util.Date'
  ],

  properties: [
    {
      name: 'sudoAsUser',
      documentation: `The user one wishes to view/manage.`,
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      required: true,
      section: 'infoSection',
      validationPredicates: [
        {
          args: ['sudoAsUser'],
          predicateFactory: function(e) {
            return e.GT(net.nanopay.ticket.SudoTicket.SUDO_AS_USER, 0);
          },
          errorString: 'Please select a user.'
        }
      ],
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          selectionView: {
            class: 'net.nanopay.auth.ui.UserSelectionView',
            emptySelectionLabel: '--'
          },
          rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
          sections: [
            {
              dao: X.data.__context__.userDAO.limit(50).orderBy(foam.nanos.auth.User.BUSINESS_NAME)
            }
          ]
        };
      }
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
      section: 'infoSection',
      //writePermissionRequired: true,
      readVisibility: 'RO',
      createVisibility: 'RW',
      updateVisibility: 'RW'
    },
    {
      name: 'approvalStatus',
      class: 'foam.core.Enum',
      of: 'foam.nanos.approval.ApprovalStatus',
      value: 'REQUESTED',
      createVisibility: 'HIDDEN',
      visibility: 'RO',
      section: 'infoSection'
    },
    {
      name: 'savedGroup',
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      createVisibility: 'HIDDEN',
      visibility: 'RO',
      section: 'metaSection'
    },
    {
      name: 'title',
      value: 'Privileged Access Request',
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
