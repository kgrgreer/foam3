foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'PublicBusinessInfo',

  documentation: "Represents a public subset of a business's properties.",

  javaImports: [
    'net.nanopay.model.Business'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'businessName',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'organization',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'businessAddress',
      view: { class: 'foam.nanos.auth.AddressDetailView' },
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'EMail',
      name: 'email',
      visibility: foam.u2.Visibility.RO
    }
  ],

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
            setBusinessAddress(business.getBusinessAddress());
            setEmail(business.getEmail());
          }
        `);
      },
    },
  ],
});
