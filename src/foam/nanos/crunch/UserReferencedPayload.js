/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.INTERFACE({
  package: 'foam.nanos.crunch',
  name: 'UserReferencedPayload',
  documentation: `
    Capability user related payload interface.
  `,

  methods: [
    {
      name: 'copyToUser',
      type: 'foam.nanos.auth.User',
      documentation: `
        Intended override on capability payload classes - allowing payload data
        to define what user property values copy over to provided user.
      `,
      args: [
        { type: 'foam.nanos.auth.User', name: 'user' }
      ],
      javaCode: `
        // Override
        return user;
      `
    }
  ]
});
