foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'PublicBusinessInfo',

  documentation: "Represents a public subset of a business's properties.",

  javaImports: [
    'net.nanopay.model.Business'
  ],

  properties: [
    net.nanopay.model.Business.ID,
    net.nanopay.model.Business.BUSINESS_NAME,
    net.nanopay.model.Business.ORGANIZATION,
    net.nanopay.model.Business.ADDRESS,
    net.nanopay.model.Business.EMAIL
  ].map((p) => p.clone().copyFrom({ visibility: foam.u2.Visibility.RO })),

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PublicBusinessInfo(Business business) {
            if ( business == null ) {
              throw new RuntimeException("PublicBusinessInfo was given a null argument.");
            };
            setId(business.getId());
            setOrganization(business.getOrganization());
            setBusinessName(business.getBusinessName());
            setAddress(business.getAddress());
            // Emails are not to be public.  CPF-1523
            // setEmail(business.getEmail());
          }
        `);
      },
    },
  ],
});
