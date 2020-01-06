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
    'foam.core.X',
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
        
        X systemX = x.put("user", new foam.nanos.auth.User.Builder(x).setId(1).build());

        try {
          DAO capabilityDAO = ((DAO) x.get("capabilityDAO")).inX(systemX);
          DAO userCapabilityJunctionDAO = ((DAO) x.get("userCapabilityJunctionDAO")).inX(systemX);

          Capability c;
          
          List<UserCapabilityJunction> userCapabilityJunctions = ((ArraySink) userCapabilityJunctionDAO
            .where(EQ(UserCapabilityJunction.SOURCE_ID, user.getId()))
            .select(new ArraySink()))
            .getArray();
          for ( UserCapabilityJunction ucj : userCapabilityJunctions ) {
            c = (Capability) capabilityDAO.find(ucj.getTargetId());
            if ( c.implies(x, permission) ) {
              return true;
            }
          }

        } catch (Exception e) {
          Logger logger = (Logger) x.get("logger");
          logger.error("check", permission, e);
        }

        return false;
      `
    }
  ]
});
