/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.connection',
  name: 'CapabilityPayloadRecord',
  documentation: `
    Recording of CapabilityPayload requests.
  `,

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware'
  ],

  properties: [
    {
      name: 'id',
      class: 'String'
    },
    {
      class: 'FObjectProperty',
      name: 'capabilityPayload',
      of: 'foam.nanos.crunch.connection.CapabilityPayload'
    },
    {
      class: 'DateTime',
      name: 'created'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent'
    }
  ]
});