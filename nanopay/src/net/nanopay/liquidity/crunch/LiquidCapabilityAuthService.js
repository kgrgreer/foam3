/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidCapabilityAuthService',
  extends: 'foam.nanos.auth.CapabilityAuthService',

  implements: [
    'foam.nanos.auth.AuthService'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'checkUser',
      documentation: `
        Check if the given input string is in the userCapabilityJunctions or
        implied by a capability in userCapabilityJunctions for a given user.
      `,
      javaCode: `
        if ( x == null || permission == null ) return false;
        if ( x.get(Session.class) == null ) return false;
        if ( user == null || ! user.getEnabled() ) return false;

        try {
          DAO capabilityDAO = (DAO) x.get("capabilityDAO");
          DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

          LiquidCapability c;
          
          List<UserCapabilityJunction> userCapabilityJunctions = ((ArraySink) user.getCapabilities(x).getJunctionDAO().select(new ArraySink())).getArray();
          for ( UserCapabilityJunction ucj : userCapabilityJunctions ) {
            c = (LiquidCapability) capabilityDAO.find(ucj.getTargetId());
            if ( c.implies(x, permission) ) return true;
          }

        } catch (Exception e) {
          Logger logger = (Logger) x.get("logger");
          logger.error("check", permission, e);
        }

        return getDelegate().checkUser(x, user, permission);
      `
    }
  ]
});
