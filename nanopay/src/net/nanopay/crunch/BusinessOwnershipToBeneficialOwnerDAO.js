foam.CLASS({
  package: 'net.nanopay.crunch',
  name: 'BusinessOwnershipToBeneficialOwnerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    A decorator to convert the crunch data to beneficialOwners to store into the beneficialOwnerDAO.
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.crunch.onboardingModels.BusinessOwnershipData',
    'net.nanopay.model.BeneficialOwner',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( obj instanceof BusinessOwnershipData ) {
          BusinessOwnershipData businessOwnerData = (BusinessOwnershipData) obj.fclone();

          DAO businessDAO = (DAO) getX().get("businessDAO");
          Business business = (Business) businessDAO.find(businessOwnerData.getBusinessId());
          if ( business != null ) {
            business.getBeneficialOwners(x).removeAll(); // To avoid duplicating on updates
            for ( int i = 1; i <= businessOwnerData.getAmountOfOwners(); i++ ) {
              business.getBeneficialOwners(x).put((BeneficialOwner) businessOwnerData.getProperty("owner"+i));
            }
          }
        }
        return null;
      `
    }
  ]
});
