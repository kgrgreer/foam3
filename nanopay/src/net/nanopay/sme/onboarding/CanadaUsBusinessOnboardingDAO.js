foam.CLASS({
  package: 'net.nanopay.sme.onboarding',
  name: 'CanadaUsBusinessOnboardingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    This decorator handles adding and updating Canadian businesses information for US payments capabilities.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.model.Business',
    'net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding',
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
        if ( ! (obj instanceof CanadaUsBusinessOnboarding) ) return getDelegate().put_(x, obj);
        
        CanadaUsBusinessOnboarding businessOnboarding = (CanadaUsBusinessOnboarding) obj;
        // TODO: Please call the java validator of the businessOnboarding here

        if ( businessOnboarding.getStatus() != net.nanopay.sme.onboarding.OnboardingStatus.SUBMITTED ) {
          return getDelegate().put_(x, businessOnboarding);
        }

        businessOnboarding.validate(x);

        DAO localBusinessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);
        DAO localUserDAO = ((DAO) x.get("localUserDAO")).inX(x);

        User user = (User)localUserDAO.find(businessOnboarding.getUserId());
        user.setIdentification(businessOnboarding.getSigningOfficerIdentification());
        localUserDAO.put(user);

        Business business = (Business)localBusinessDAO.find(businessOnboarding.getBusinessId());
        business.setBusinessRegistrationDate(businessOnboarding.getBusinessFormationDate());
        business.setBusinessRegistrationNumber(businessOnboarding.getBusinessRegistrationNumber());
        business.setCountryOfBusinessRegistration(businessOnboarding.getCountryOfBusinessFormation()); 
        localBusinessDAO.put(business);

        return getDelegate().put_(x, businessOnboarding);
      `
    }
  ]
});