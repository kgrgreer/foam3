/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'PublicUserInfo',
  documentation: `The base model for representing the public information of a User`,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.model.Business'
  ],

  tableColumns: [
    'id', 'firstName', 'lastName', 'organization', 'email'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 60,
      documentation: `The unique identifier for the User.`,
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'firstName',
      documentation: 'The first name of the individual person, or real user.',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'lastName',
      documentation: 'The last name of the individual person, or real user.',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'businessName',
      documentation: `The name of the business associated with the public
        information of a User.`,
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'operatingBusinessName',
      documentation: `The business name displayed to the public. This may differ
        from the organization name.`,
          // Is displayed on client if present taking place of organziation name.
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'organization',
      documentation: `The organization/business associated with the public
        nformation of a User.`,
      visibility: 'RO'
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
      name: 'address',
      documentation: `Returns the postal address of the business associated with the
        public information of a User.  It is drawn from the Address model.`,
      visibility: 'RO'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'phone',
      documentation: `Returns the phone number of the business associated with the
        public information of a User. It is drawn from the Phone model.`,
      view: { class: 'foam.u2.detail.VerticalDetailView' },
      visibility: 'RO'
    },
    {
      class: 'PhoneNumber',
      name: 'phoneNumber'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'businessProfilePicture',
      documentation: `The profile picture of the business, initially defaulting
        to a placeholder picture.`,
      view: { class: 'foam.nanos.auth.ProfilePictureView' },
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'type',
      documentation: 'The type of the public information of a User.'
    },
    {
      class: 'String',
      name: 'spid'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      code: function() {
        return this.operatingBusinessName
          ? this.operatingBusinessName
          : this.organization
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
        return ! SafetyUtil.isEmpty(this.getOperatingBusinessName())
          ? this.getOperatingBusinessName()
          : ! SafetyUtil.isEmpty(this.getOrganization())
            ? this.getOrganization()
            : ! SafetyUtil.isEmpty(this.getBusinessName())
              ? this.getBusinessName()
              : ! SafetyUtil.isEmpty(this.getFirstName())
                ? ! SafetyUtil.isEmpty(this.getLastName())
                  ? this.getFirstName() + " " + this.getLastName()
                  : this.getFirstName()
                : "Unknown";
      `
    },
    {
      name: 'compareTo',
      type: 'int',
      args:
      [
        {
          name: 'o',
          type: 'Object',
        }
      ],
      javaCode: `
        if ( o == null ) return 1;
        if ( o == this ) return 0;
        if ( ! ( o instanceof foam.core.FObject ) ) return 1;
        if ( getClass() != o.getClass() ) {
          return getClassInfo().getId().compareTo(((foam.core.FObject)o).getClassInfo().getId());
        }
        
        PublicUserInfo o2 = (PublicUserInfo) o;
        int cmp;

        cmp = foam.util.SafetyUtil.compare(this.toSummary(), ((PublicUserInfo)o).toSummary());
        if ( cmp != 0 ) return cmp;
        return FObject.super.compareTo(o);
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PublicUserInfo(User user) {
            if ( user == null ) return;
            if ( user instanceof Business ) {
              Business business = (Business) user;
              setOperatingBusinessName(business.getOperatingBusinessName());
            }
            setId(user.getId());
            setFirstName(user.getFirstName());
            setLastName(user.getLastName());
            setOrganization(user.getOrganization());
            setBusinessName(user.getBusinessName());
            setEmail(user.getEmail());
            setProfilePicture(user.getProfilePicture());
            setAddress(user.getAddress());
            setPhoneNumber(user.getPhoneNumber());
            setType(user.getType());
            setSpid(user.getSpid());
          }
        `);
      },
    },
  ],
});
