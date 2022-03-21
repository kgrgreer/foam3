/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'AuthPermissionPredicate',

  extends: 'foam.mlang.predicate.AbstractPredicate',

  documentation: `
    A predicate used for checking a permissioon.
  `,

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.AuthService',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers'
  ],

  properties: [
    {
      name: 'permission',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        X x = (X) obj;
        try {
          AuthService auth = (AuthService) x.get("auth");
          return auth.check(x, getPermission());
        } catch (Exception e) {
          if ( x != null ) {
            Logger logger = (Logger) x.get("logger");
            Loggers.logger(x, this).warning("permission",getPermission(), e);
          }
          return false;
        }
      `
    }
  ]
});
