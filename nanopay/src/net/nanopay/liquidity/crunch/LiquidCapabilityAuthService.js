/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidCapabilityAuthService',
  extends: 'foam.nanos.auth.CapabilityAuthService',
  documentation: ` 
  Liquid-specific implementation for checking if a user has a liquid capability
  `,

  implements: [
    'foam.nanos.auth.AuthService'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',
    'java.util.Date',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'checkUser',
      javaCode: `
        if ( x == null || permission == null ) return false;
        if ( x.get(Session.class) == null ) return false;
        if ( user == null || ! user.getEnabled() ) return false;

        // dissect the permission string
        String[] permissionComponents = permission.split(".");
        if ( permissionComponents.length != 3 ) {
          throw new RuntimeException("Invalid permission string");
        }
        String className = permissionComponents[0];
        String operation = permissionComponents[1];
        // Object objId;
        try {
          objId = (Long) Long.parse(objId, "10");
        } else {
          objId = (String) objId;
        }

        Boolean isGlobal = ! ( "account".equals(className) || "transaction".equals(className)  ) )

        // first problem - how to differentiate between global vs account based roles when granting permission to assigner
        Boolean isGlobal = isGlobal && ( "usercapabilityjunction".equals(className) && )




        return getDelegate().checkUser(x, user, permission);
      `
    }
  ]
});
  