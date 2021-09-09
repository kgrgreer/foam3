/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'RFITicket',
  extends: 'foam.nanos.ticket.Ticket',

  documentation: 'Request for information ticket.',

  javaImports: [
  ],

  properties: [
    {
      name: 'type',
      value: 'Request for information'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'attachments'
    }
  ],

});
