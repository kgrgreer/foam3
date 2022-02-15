/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'RfiTicket',
  extends: 'foam.nanos.ticket.Ticket',

  documentation: 'Request for information ticket.',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'type',
      value: 'Request for information',
      section: 'infoSection'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'attachments',
      section: 'infoSection'
    },
    {
      class: 'String',
      name: 'description',
      section: 'infoSection'
    },
    {
      class: 'String',
      name: 'documentType',
      section: 'infoSection'
    },
    {
      class: 'String',
      name: 'sessionToken',
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    {
      name: 'createCommentNotification',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'old', type: 'Ticket' }
      ],
      javaCode: `
        if ( old == null ) {
          return;
        }
        
        super.createCommentNotification(x,old);
      `
    },
    {
      name: 'createExternalCommentNotification',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'old', type: 'Ticket' }
      ],
      javaCode: `
        if ( old == null ) {
          return;
        }
        
        super.createExternalCommentNotification(x,old);
      `
    }
  ]
});
