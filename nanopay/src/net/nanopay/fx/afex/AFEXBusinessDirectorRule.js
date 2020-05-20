foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBusinessDirectorRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to push Business Directors to AFEX after AFEX Business is created.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          if ( ! (obj instanceof AFEXBusiness) ) {
            return;
          }

          AFEXBusiness afexBusiness = (AFEXBusiness) obj;
          Business business = (Business) ((DAO) x.get("localBusinessDAO")).find(EQ(Business.ID, afexBusiness.getUser()));
          if ( business != null ) {
            ((AFEXServiceProvider) x.get("afexServiceProvider")).pushBusinessDirectors(business, afexBusiness.getApiKey());
          }
        }
      }, "Rule to push Business Directors to AFEX after AFEX Business is created.");
      `
    }
  ]

});
