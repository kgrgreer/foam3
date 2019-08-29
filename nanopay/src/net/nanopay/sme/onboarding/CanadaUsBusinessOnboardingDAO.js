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
    'foam.util.SafetyUtil',
    'net.nanopay.documents.AcceptanceDocumentService',
    'net.nanopay.model.Business',
    'net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding'
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
        CanadaUsBusinessOnboarding old = (CanadaUsBusinessOnboarding)getDelegate().find_(x, obj);

        if ( businessOnboarding.getStatus() != net.nanopay.sme.onboarding.OnboardingStatus.SUBMITTED ) {
          return getDelegate().put_(x, businessOnboarding);
        }

        // if the businessOnboarding is already set to SUBMITTED, do not allow modification
        if ( old != null && old.getStatus() == net.nanopay.sme.onboarding.OnboardingStatus.SUBMITTED ) return getDelegate().put_(x, businessOnboarding);
  
        // TODO: Please call the java validator of the businessOnboarding here

        businessOnboarding.validate(x);

        DAO localBusinessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);

        Business business = (Business)localBusinessDAO.find(businessOnboarding.getBusinessId());
        business.setBusinessRegistrationDate(businessOnboarding.getBusinessFormationDate());
        business.setBusinessRegistrationNumber(businessOnboarding.getBusinessRegistrationNumber());
        business.setCountryOfBusinessRegistration(businessOnboarding.getCountryOfBusinessFormation()); 
        localBusinessDAO.put(business);

        // ACCEPTANCE DOCUMENTS
        Long oldAgreementAFEX = old == null ? 0 : old.getAgreementAFEX();
        if ( oldAgreementAFEX != businessOnboarding.getAgreementAFEX() ) {
          AcceptanceDocumentService documentService = (AcceptanceDocumentService) x.get("acceptanceDocumentService");
          documentService.updateUserAcceptanceDocument(x, businessOnboarding.getUserId(), businessOnboarding.getAgreementAFEX(), (businessOnboarding.getAgreementAFEX() != 0));
        }
        Long oldInternationAgrement = old == null ? 0 : old.getNanopayInternationalPaymentsCustomerAgreement();
        if ( oldInternationAgrement != businessOnboarding.getNanopayInternationalPaymentsCustomerAgreement() ) {
          AcceptanceDocumentService documentService = (AcceptanceDocumentService) x.get("acceptanceDocumentService");
          documentService.updateUserAcceptanceDocument(x, businessOnboarding.getUserId(), businessOnboarding.getNanopayInternationalPaymentsCustomerAgreement(),
            businessOnboarding.getNanopayInternationalPaymentsCustomerAgreement() != 0 );
        }
        return getDelegate().put_(x, businessOnboarding);
      `
    }
  ]
});
