/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'AuthorizableMixin',
  abstract: true,

  implements: [
    'foam.nanos.auth.Authorizable'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Authorizer',
      name: 'defaultAuthorizer',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: 'return new foam.nanos.auth.StandardAuthorizer(getClass().getSimpleName().toLowerCase());',
      documentation: `
        An optional defaultAuthorizer to be used in the case that a custom
        implementation is not required for a method
      `,
    }
  ]
});