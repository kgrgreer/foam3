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
  name: 'SudoTicketApprovalRequestRule',
  extends: 'foam.nanos.ruler.Rule',

  documentation: 'Generate an Approval Request for priveledge access.',

  javaImports: [
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'java.util.List'
  ],

  properties: [
    // {
    //   class: 'Boolean',
    //   name: 'autoApprove',
    //   value: false
    // },
    {
      class: 'List',
      name: 'approvers',
      documentation: 'List of user that will approve access.',
      javaType: 'java.util.ArrayList<java.lang.Long>',
      view: {
        class: 'foam.u2.view.ReferenceArrayView',
        daoKey: 'userDAO'
      }
    }
  ],

  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        if ( getApprovers().size() == 0 ) {
        super.validate(x);
          Alarm alarm = new Alarm(this.getClass().getSimpleName(), AlarmReason.CONFIGURATION);
          alarm.setNote("No Approvers");
          ((foam.dao.DAO) x.get("alarmDAO")).put(alarm);

          throw new IllegalStateException("SudoTicketApprovalRequestRule no approvers");
        }
      `
    }
  ]
});
