foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidCapabilityAuthService',
  extends: 'foam.nanos.auth.CapabilityAuthService',

  implements: [
    'foam.nanos.auth.AuthService'
  ],

  javaImports: [
    'foam.dao.ProxySink',
    'foam.dao.ArraySink',
    'foam.dao.LimitedSink',
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
        logger.info(permission);

        try {
          DAO capabilityDAO = (DAO) x.get("localCapabilityDAO");
          DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

          ProxySink proxy = new ProxySink(x, new LimitedSink(x, 1, 0, new ArraySink())) {
            int count = 0;
            @Override
            public void put(Object o, Detachable sub) {
              UserCapabilityJunction ucj = (UserCapabilityJunction) ((UserCapabilityJunction) o).deepClone();
              Capability c = (Capability) capabilityDAO.find(ucj.getTargetId());
              if ( c.implies(x, permission) ) {
                getDelegate().put(o, sub);
              }
            }
          };

          List<UserCapabilityJunction> ucjs = ((ArraySink) ((ProxySink) userCapabilityJunctionDAO
            .where(EQ(UserCapabilityJunction.SOURCE_ID, user.getId()))
            .limit(1)
            .select(proxy))
            .getDelegate())
            .getArray();
            
          if ( ucjs.size() > 0) {
            return true;
          }
        } catch (Exception e) {
          logger.error("check", permission, e);
        }
        return false;
      `
    }
  ]
});