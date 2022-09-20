/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'ClientEmailVerificationService',
  implements: [ 'foam.nanos.auth.email.EmailVerificationService' ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.auth.email.EmailVerificationService',
      name: 'delegate'
    }
  ]
});

