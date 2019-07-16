foam.CLASS({
  package: 'net.nanopay.business',
  name: 'UpdateBusinessEmailRule',

  documentation: '',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.dao.DAO',
    'foam.core.X',
    'foam.nanos.auth.User',
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessUserJunction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            BusinessUserJunction junction = (BusinessUserJunction) obj;
            DAO localBusinessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);
            DAO localUserDAO = ((DAO) x.get("localUserDAO")).inX(x);
    
            // Find signing officer
            User user = (User) localUserDAO.find(junction.getTargetId());
    
            // Find the business
            Business business = (Business) localBusinessDAO
              .find(junction.getSourceId());
    
            // Update business's email so that the new signing office can
            // receive the email notification
            business.setEmail(user.getEmail());
            localBusinessDAO.put(business);
          }
        }, "Updating business's email");
      `
    }
  ]
});
