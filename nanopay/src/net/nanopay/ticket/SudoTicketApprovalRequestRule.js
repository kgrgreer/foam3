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
        super.validate(x);
        if ( getApprovers().size() == 0 ) {
          throw new IllegalStateException("SudoTicketApprovalRequestRule approvers not set.");
        }
      `
    }
  ]
});
