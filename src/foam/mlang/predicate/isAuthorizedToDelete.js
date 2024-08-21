/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'isAuthorizedToDelete',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Expression which returns true if the user has a given permission.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.nanos.auth.AuthorizationException'
  ],

  properties: [
    {
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      javaType: 'foam.core.X',
      flags: ['java'],
      name: 'userContext'
    },
    {
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      javaType: 'foam.nanos.auth.Authorizer',
      flags: ['java'],
      name: 'authorizer'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function() {
        // Authorization on the client is futile since the user has full control
        // over the code that executes on their machine.
        // A client-side implementation of this predicate would also have to be
        // async in this case because we would need to access the auth service,
        // but we don't support async predicate execution on the client as far
        // as I'm aware.
        return true;
      },
      javaCode: `
        X x = (X) getUserContext();
        foam.nanos.auth.Authorizer authorizer = getAuthorizer();
        try {
          authorizer.authorizeOnDelete(x, (FObject) obj);
        } catch ( AuthorizationException e ) {
          return false;
        }
        return true;
      `
    },
  ]
});
