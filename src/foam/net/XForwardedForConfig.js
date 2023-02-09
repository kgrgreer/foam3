/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.net',
  name: 'XForwardedForConfig',

  documentation: 'XForwardedForConfigDAO allows different load balancer configurations to correctly pull the client IP for x-forwarded-for header based on index from last address',

  ids: [ 'ipMatch' ],

  properties: [
    {
      documentation: `
        IP address or partial that should apply given offset, more specific subnet wil override less specific like so
        192.168.0.23
        192.168.0
        192.168
        `,
      name: 'ipMatch',
      class: 'String'
    },
    {
      documentation: 'Offset from last address to pull as client IP (0 = last address in the list)',
      name: 'indexOffset',
      class: 'Int'
    }
  ]
})

