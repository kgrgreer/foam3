foam.CLASS({
    package: 'net.nanopay.liquidity.crunch',
    name: 'RemoveJunctionsOnCapabilityRemoval',
  
    documentation: 'Rule to remove any user-capability relationships when a capability is removed',
  
    implements: [
      'foam.nanos.ruler.RuleAction'
    ],
  
    javaImports: [
      'foam.dao.DAO',
      'foam.nanos.crunch.UserCapabilityJunction',
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.nanos.crunch.Capability',
      'static foam.mlang.MLang.*',
      'foam.nanos.auth.LifecycleAware',
      'java.util.List',
      'foam.dao.ArraySink'
    ],
  
    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            if ( ((LifecycleAware) obj).getLifecycleState() == foam.nanos.auth.LifecycleState.DELETED ) {
              DAO dao = (DAO) x.get("userCapabilityJunctionDAO");
              List<UserCapabilityJunction> list= ((ArraySink) dao
                .where(EQ(UserCapabilityJunction.TARGET_ID, ((Capability) obj).getId()))
                .select(new ArraySink()))
                .getArray();
              dao.where(EQ(UserCapabilityJunction.TARGET_ID, ((Capability) obj).getId())).removeAll();
            }
          }
        }, "Remove Junctions On Capability Removal");
        `
      }
    ]
  });