/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 foam.CLASS({
  package: 'foam.nanos.auth.predicate',
  name: 'IsAnonymousPredicate',

  extends: 'foam.mlang.predicate.AbstractPredicate',

  implements: [ 'foam.core.Serializable' ],

  documentation: 'Check if user in authservice is anonymous. Requires no arguments.',

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.AuthService'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ! (obj instanceof X) ) return false;
        X x = (X)obj;
        AuthService authService = (AuthService)x.get("auth");
        if ( authService == null ) return false;
        return authService.isAnonymous(x);
      `
    }
  ]
});
