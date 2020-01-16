foam.CLASS({
    package: 'net.nanopay.liquidity.crunch',
    name: 'RemoveJunctionsOnCapabilityRemoval',
  
    documentation: 'Rule to remove any user-capability relationships when a capability is removed',
  
    implements: [
      'foam.nanos.ruler.RuleAction'
    ],
  
    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.nanos.crunch.Capability',
    ],
  
    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            ((Capability) obj).getUsers(x).getJunctionDAO().removeAll();
          }
        }, "Remove Junctions On Capability Removal");
        `
      }
    ]
  });