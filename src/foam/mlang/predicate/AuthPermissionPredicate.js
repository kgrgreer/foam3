/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
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
    'foam.nanos.logger.Logger'
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
      args: [
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      javaCode: `
        X x = (X) obj;
        try {
          AuthService auth = (AuthService) x.get("auth");
          return auth.check(x, getPermission());
        } catch (Exception e) {
          if ( x != null ) {
            Logger logger = (Logger) x.get("logger");
            logger.warning(this.getClass().getSimpleName(), "predicate auth check - something went wrong checking permission: ", getPermission());
          }

          return false;
        }
      `
    }
  ]
});
