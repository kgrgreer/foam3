foam.CLASS({
  package: 'net.nanopay.liquidity.ruler',
  name: 'LogoutUserOnCapabilityUpdateAction',
  extends: 'net.nanopay.auth.ruler.LogoutUserAction',

  documentation: 'This rule action logs out users after a capability update.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.CapabilityRequest',
    'net.nanopay.liquidity.crunch.LiquidCapability',
    'java.util.List'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        LiquidCapability capability = (LiquidCapability) obj;

        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");

        List ucjsWithCapabilities = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.TARGET_ID, capability.getId())).select(new ArraySink())).getArray();
        
        // Check if there are users
        if (ucjsWithCapabilities.size() <= 0) {
          return;
        }
        
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            // Logout all users in the request
            for ( int i = 0; i < ucjsWithCapabilities.size(); i++ ){
              UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsWithCapabilities.get(i);
              long currentUserId = currentUCJ.getSourceId();

              if ( currentUserId != 0 ){
                logoutUser(x, currentUserId);
              }
            }
          }
        },
        "Invalidating sessions for user on capability update" + capability.getId() + ".");
      `
    }
  ]
});

