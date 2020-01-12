foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidCapabilityAuthService',
  extends: 'foam.nanos.auth.CapabilityAuthService',

  implements: [
    'foam.nanos.auth.AuthService'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.core.Detachable',
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
        
        Logger logger = (Logger) x.get("logger");

        try {
          DAO capabilityDAO = (DAO) x.get("localCapabilityDAO");
          DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

          userCapabilityJunctionDAO
            .where(EQ(UserCapabilityJunction.SOURCE_ID, user.getId()))
            .select(new AbstractSink() {
              @Override
              public void put(Object o, Detachable sub) {
                UserCapabilityJunction ucj = (UserCapabilityJunction) ((UserCapabilityJunction) o).deepClone();
                Capability c = (Capability) capabilityDAO.find(ucj.getTargetId());
                if ( c.implies(x, permission) ) {
                  sub.detach();
                  throw new RuntimeException("userCapabilityJunction found");
                }
              }
            });

        } catch (Exception e) {
          logger.info("userCapabilityJunction found : ", "check", permission);
          return true;
        }
        logger.error("userCapabilityJunction not found : ", "check", permission);
        return false;
      `
    }
  ]
});
