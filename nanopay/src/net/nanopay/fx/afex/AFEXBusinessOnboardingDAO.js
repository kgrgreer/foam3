foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBusinessOnboardingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorates localUserDAO and push business to AFEX when business pass compliance.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business',
   
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      if ( !(obj instanceof Business) ) {
        return getDelegate().put_(x, obj);
      }
  
      Logger logger = (Logger) x.get("logger");
      logger.debug(this.getClass().getSimpleName(), "put", obj);
  
      Business business = (Business) getDelegate().put_(x, obj);
      if ( business.getCompliance().equals(ComplianceStatus.PASSED) ) {
        AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
        afexServiceProvider.onboardBusiness(business);
      }
  
      return business;

      `
    }
  ]
});