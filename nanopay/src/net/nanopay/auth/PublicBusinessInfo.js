foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'PublicBusinessInfo',

  documentation: `Represents a public subset of a business's properties.`,

  javaImports: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Region',
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessSector',
    'foam.core.X',
    'foam.dao.DAO'
  ],

  properties: [

    {
      class: 'String',
      name: 'fullAddress',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'businessName',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'organization',
      visibility: 'RO'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'businessSectorId',
      visibility: 'RO'
    }
  ],

  //   net.nanopay.model.Business.ID,
  //   net.nanopay.model.Business.BUSINESS_NAME,
  //   net.nanopay.model.Business.ORGANIZATION,
  //   net.nanopay.model.Business.ADDRESS,
  //   net.nanopay.model.Business.BUSINESS_SECTOR_ID,
  // ].map((p) => p.clone().copyFrom({ visibility: 'RO' })),

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PublicBusinessInfo(X x, Business business) {
            if ( business == null ) {
              throw new RuntimeException("PublicBusinessInfo was given a null argument.");
            };

            DAO businessSectorDAO = (DAO) x.get("businessSectorDAO");
            DAO countryDAO        = (DAO) x.get("countryDAO");
            DAO regionDAO         = (DAO) x.get("regionDAO");
            
            BusinessSector businessSector = (BusinessSector) businessSectorDAO.find(business.getBusinessSectorId());
            Country        country        = (Country)        countryDAO.find(business.getAddress().getCountryId());
            Region         region         = (Region)         regionDAO.find(business.getAddress().getRegionId());

            Address address = business.getAddress();
            StringBuilder sb = new StringBuilder();
            sb.append(address.getStreetNumber());
            sb.append(" ");
            sb.append(address.getStreetName());
            sb.append(" ");
            sb.append(address.getCity());
            sb.append(" ");
            sb.append(region.getName());
            sb.append(" ");
            sb.append(country.getName());
            sb.append(" ");
            sb.append(address.getPostalCode());
            
            setFullAddress(sb.toString());
            setId(business.getId());
            setOrganization(business.getOrganization());
            setBusinessName(business.getBusinessName());
            setAddress(address);
            setBusinessSectorId(business.getBusinessSectorId());
          }
        `);
      },
    },
  ],
});
