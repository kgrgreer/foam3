foam.CLASS({
  package: 'net.nanopay.liquidity.ruler',
  name: 'LogoutUserOnAssignmentAction',
  extends: 'net.nanopay.auth.ruler.LogoutUserAction',

  documentation: `This rule action logs out users after an assignment.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'net.nanopay.liquidity.crunch.CapabilityRequest'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      CapabilityRequest request = (CapabilityRequest) obj;
      
      // Check if there are users
      if (request.getUsers().size() <= 0) {
        return;
      }
      
      // Update the amount spent in the limit state
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          // Logout all users in the request
          for (long userId : request.getUsers()) {
            if ( userId != 0 )
              logoutUser(x, userId);
          }
        }
      },
      "Invalidating sessions for user in capability request " + request.getId() + ".");
      `
    }
  ]
});

