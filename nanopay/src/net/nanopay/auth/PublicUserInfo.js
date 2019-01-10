foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'PublicUserInfo',
  documentation: `This model represents a public subset of a user's properties`,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'firstName',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'lastName',
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
      class: 'EMail',
      name: 'email'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      view: { class: 'foam.nanos.auth.ProfilePictureView' }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'businessAddress',
      view: { class: 'foam.nanos.auth.AddressDetailView' },
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'businessPhone',
      view: { class: 'foam.nanos.auth.PhoneDetailView' },
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'businessProfilePicture',
      view: { class: 'foam.nanos.auth.ProfilePictureView' },
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'type',
      documentation: 'Type of user. (Business, Contact, etc.)'
    }
  ],

  methods: [
    {
      name: 'label',
      code: function() {
        return this.organization
          ? this.organization
          : this.businessName
            ? this.businessName
            : this.firstName
              ? this.lastName
                ? `${this.firstName} ${this.lastName}`
                : this.firstName
              : 'Unknown';
      },
      type: 'String',
      javaCode: `
        return ! SafetyUtil.isEmpty(this.getOrganization())
          ? this.getOrganization()
          : ! SafetyUtil.isEmpty(this.getBusinessName())
            ? this.getBusinessName()
            : ! SafetyUtil.isEmpty(this.getFirstName())
              ? ! SafetyUtil.isEmpty(this.getLastName())
                ? this.getFirstName() + " " + this.getLastName()
                : this.getFirstName()
              : "Unknown";
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PublicUserInfo(User user) {
            if ( user == null ) return;
            setId(user.getId());
            setFirstName(user.getFirstName());
            setLastName(user.getLastName());
            setOrganization(user.getOrganization());
            setBusinessName(user.getBusinessName());
            setEmail(user.getEmail());
            setProfilePicture(user.getProfilePicture());
            setBusinessProfilePicture(user.getBusinessProfilePicture());
            setBusinessAddress(user.getBusinessAddress());
            setBusinessPhone(user.getBusinessPhone());
            setType(user.getType());
          }
        `);
      },
    },
  ],
});
