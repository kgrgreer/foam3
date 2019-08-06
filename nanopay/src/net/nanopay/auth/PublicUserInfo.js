foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'PublicUserInfo',
  documentation: `The base model for representing the public information of a User`,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
  ],

  tableColumns: [
    'id', 'firstName', 'lastName', 'organization', 'email'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50,
      documentation: `The unique identifier for the User.`,
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'firstName',
      documentation: 'The first name of the individual person, or real user.',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'lastName',
      documentation: 'The last name of the individual person, or real user.',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'businessName',
      documentation: `The name of the business associated with the public 
        information of a User.`,
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'organization',
      documentation: `The organization/business associated with the public 
        nformation of a User.`,
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'EMail',
      name: 'email',
      documentation: 'The email address of the public information of a User.',
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      documentation: `The profile picture of the individual user, or real user, 
        initially defaulting to a placeholder picture.`,
      view: { class: 'foam.nanos.auth.ProfilePictureView' }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'businessAddress',
      documentation: `Returns the postal address of the business associated with the 
        public information of a User.  It is drawn from the Address model.`,
      view: { class: 'foam.nanos.auth.AddressDetailView' },
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'businessPhone',
      documentation: `Returns the phone number of the business associated with the 
        public information of a User. It is drawn from the Phone model.`,
      view: { class: 'foam.u2.detail.VerticalDetailView' },
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'businessProfilePicture',
      documentation: `The profile picture of the business, initially defaulting 
        to a placeholder picture.`,
      view: { class: 'foam.nanos.auth.ProfilePictureView' },
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'type',
      documentation: 'The type of the public information of a User.'
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
            setBusinessAddress(user.getAddress());
            setBusinessPhone(user.getPhone());
            setType(user.getType());
          }
        `);
      },
    },
  ],
});
