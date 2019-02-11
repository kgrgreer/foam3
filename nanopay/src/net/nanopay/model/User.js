foam.CLASS({
  refines: 'foam.nanos.auth.User',

  documentation: 'Base user in the system. Utlized for authentication,' +
      ' personal information and permitting certain actions.',

  implements: [
    'foam.nanos.auth.DeletedAware'
  ],

  javaImports: [
    'foam.mlang.MLang',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'static foam.mlang.MLang.NOT',

    'net.nanopay.contacts.Contact'
  ],

  requires: [
    'net.nanopay.onboarding.model.Questionnaire'
  ],

  tableColumns: [
    'id', 'deleted', 'type', 'group', 'spid', 'firstName', 'lastName', 'organization', 'email'
  ],

  properties: [
    {
      class: 'Int',
      name: 'ownershipPercent',
      documentation: 'For principal owners. This represents the percentage of ownership.',
    },
    {
      class: 'Reference',
      targetDAOKey: 'businessTypeDAO',
      name: 'businessTypeId',
      of: 'net.nanopay.model.BusinessType',
      documentation: 'Proprietor details for business.',
      flags: ['js']
    },
    {
      class: 'Reference',
      targetDAOKey: 'businessSectorDAO',
      name: 'businessSectorId',
      of: 'net.nanopay.model.BusinessSector',
      documentation: 'General economic grouping for business.',
      flags: ['js'],
      view: function(args, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: { class: 'net.nanopay.sme.onboarding.ui.BusinessSectorSelectionView' },
          rowView: { class: 'net.nanopay.sme.onboarding.ui.BusinessSectorCitationView' },
          sections: [
            {
              heading: 'Industries',
              dao: X.businessSectorDAO
            }
          ],
          search: true
        };
      }
    },
    {
      class: 'Boolean',
      name: 'invited',
      value: false,
      documentation: 'Determines if user was invited to the' +
          ' platform, dictates invitation email.',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'invitedBy',
      documentation: 'Reference to inviter.'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'previousStatus',
      documentation: 'Stores the users previous status.'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      javaGetter: `
        return net.nanopay.admin.model.AccountStatus.DISABLED != getStatus();
      `,
      documentation: 'enabled is Deprecated. Use status instead.',
      hidden: true
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'status',
      documentation: 'User status (pending, active, disabled).' +
          ' Dictates portal accessibility.',
      tableCellFormatter: function(status) {
        var bgColour = '#a4b3b8';
        var borderColour = '#a4b3b8';
        var textColour = '#ffffff';
        if ( status.label == 'Submitted' ) {
          bgColour = 'transparent';
          borderColour = '#2cab70';
          textColour = '#2cab70';
        } else if ( status.label == 'Active' ) {
          bgColour = '#2cab70';
          borderColour = '#2cab70';
          textColour = '#ffffff';
        }
        if ( status.label != '' ) {
          this.start()
            .add(status.label)
            .style({
              'color': textColour,
              'border': '1px solid ' + borderColour,
              'border-radius': '100px',
              'background': bgColour,
              'padding': '3px 10px 3px 10px',
              'display': 'inline-block'
            })
          .end();
        }
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.ComplianceStatus',
      name: 'compliance',
      documentation: 'Admin user account approval status.',
      tableCellFormatter: function(status) {
        return status.label;
      },
      permissionRequired: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.onboarding.model.Questionnaire',
      name: 'questionnaire',
      documentation: 'Questionnaire response.'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'additionalDocuments',
      documentation: 'Additional documents for compliance verification.',
      view: function(_, X) {
        return {
          class: 'net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView',
          documents$: X.data.additionalDocuments$
        };
      }
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'beneficialOwnerDocuments',
      documentation: 'Additional documents for beneficial owners verification.',
      view: function(_, X) {
        return {
          class: 'net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView',
          documents$: X.data.beneficialOwnerDocuments$
        };
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.auth.User',
      name: 'principalOwners',
      documentation: 'Owners of business.'
    },
    {
      class: 'String',
      name: 'jobTitle',
      label: 'Job Title',
      documentation: 'Job title of user.',
      validateObj: function(jobTitle) {
        var re = /^[a-zA-Z0-9 ]{1,35}$/;
        if ( jobTitle.length > 0 && ! re.test(jobTitle) ) {
          return 'Invalid job title.';
        }
      }
    },
    {
      class: 'String',
      name: 'principleType',
      label: 'Principal Type',
      documentation: 'Type of principal owner. (shareholder, owner etc...)'
    },
    {
      class: 'Boolean',
      name: 'welcomeEmailSent',
      documentation: 'Determines whether welcome email has been sent.',
      value: false,
    },
    {
      class: 'Boolean',
      name: 'portalAdminCreated',
      documentation: 'Determines whether user was created by an admin user.',
      value: false,
    },
    // NOTE: The following is subject to change and is not finalized.
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'businessPhone',
      factory: function() {
        return this.Phone.create();
      },
      view: { class: 'foam.nanos.auth.PhoneDetailView' }
    },
    {
      class: 'String',
      name: 'businessIdentificationNumber',
      transient: true,
      documentation: 'A number issued by an Issuing Authority such' +
          ' as the CRA. Used as an identifier as well as for tax purposes.',
      getter: function() {
        return this.businessRegistrationNumber;
      },
      setter: function(x) {
        this.businessRegistrationNumber = x;
      },
      javaGetter: `return getBusinessRegistrationNumber();`,
      javaSetter: `setBusinessRegistrationNumber(val);`
    },
    {
      class: 'String',
      name: 'businessRegistrationNumber',
      width: 35,
      documentation: 'Business Identification Number (BIN) ' +
          'that identifies your business to federal, ' +
          'provincial, and municipal governments.',
      validateObj: function(businessRegistrationNumber) {
        var re = /^[a-zA-Z0-9 ]{1,35}$/;
        if ( businessRegistrationNumber.length > 0 &&
              ! re.test(businessRegistrationNumber) ) {
          return 'Invalid registration number.';
        }
      }
    },
    {
      class: 'String',
      name: 'issuingAuthority',
      transient: true,
      documentation: 'An organization that has the' +
          ' power to issue an official document.',
      getter: function() {
        return this.businessRegistrationAuthority;
      },
      setter: function(x) {
        this.businessRegistrationAuthority = x;
      },
      javaGetter: `return getBusinessRegistrationAuthority();`,
      javaSetter: `setBusinessRegistrationAuthority(val);`
    },
    {
      class: 'String',
      name: 'businessRegistrationAuthority',
      documentation: 'An organization that has the' +
          ' power to issue and process a business registration.',
      width: 35,
      validateObj: function(businessRegistrationAuthority) {
        var re = /^[a-zA-Z0-9 ]{1,35}$/;
        if ( businessRegistrationAuthority.length > 0 &&
            ! re.test(businessRegistrationAuthority) ) {
          return 'Invalid issuing authority.';
        }
      }
    },
    {
      class: 'Date',
      name: 'businessRegistrationDate',
      documentation: 'Date the business was registered ' +
          'by their issuing authority.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'businessAddress',
      factory: function() {
        return this.Address.create();
      },
      view: { class: 'foam.nanos.auth.AddressDetailView' }
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'businessProfilePicture',
      view: {
        class: 'foam.nanos.auth.ProfilePictureView',
        placeholderImage: 'images/business-placeholder.png'
      }
    },
    {
      class: 'Boolean',
      name: 'onboarded',
      documentation: 'Signifies completion of business ' +
          'registration. Dictates portal views after' +
          'compliance and account approval.',
      value: false,
      permissionRequired: true
    },
    {
      class: 'Boolean',
      name: 'createdPwd',
      value: false,
      documentation: 'Determines whether user is using' +
          ' his own unique password or one that was system generated.'
    },
    {
      class: 'Int',
      name: 'inviteAttempts',
      value: 0,
      documentation: 'Number of invite attempt.',
    },
    {
      class: 'String',
      name: 'operatingBusinessName',
      documentation: `Business name displayed to public.
          Differs from organization by acting as a display name for businesses.
          Is displayed on client if present taking place of organziation name.`
    },
    {
      class: 'Boolean',
      name: 'holdingCompany',
      documentation: `
        States if user is a holding company. Holding companies represent a corporate group which
        own shares of multiple companies.
      `
    },
    {
      class: 'Boolean',
      name: 'thirdParty',
      documentation: `
        States if the user is taking instructions from and/or acting on behalf of a 3rd party.
      `
    },
    {
      class: 'FObjectProperty',
      name: 'identification',
      of: 'net.nanopay.model.PersonalIdentification',
      documentation: `
        User identitfication. Differs from business identification by relating to an individual.
      `
    },
    {
      class: 'Boolean',
      name: 'PEPHIORelated',
      documentation: `States if user is a domestic or foreign Polically Exposed Person (PEP)
          or Head of an International Organization (HIO), or related to any such person.
      `
    },
    {
      class: 'Boolean',
      name: 'signingOfficer',
      documentation: `States if user is the signing officer capable of additional functionality when
        acting as a business and providing additional information on behalf of business.
      `
    },
    {
      class: 'FObjectProperty',
      name: 'suggestedUserTransactionInfo',
      of: 'net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo',
      documentation: `
        Suggested user information relating to expected transaction types,
        frequency, amount and currencies. Required for KYC purposes.
      `
    },
    {
      class: 'String',
      name: 'targetCustomers',
      documentation: 'Who the business markets its products and services to'
    },
    {
      class: 'String',
      name: 'sourceOfFunds',
      documentation: 'Where the business receives its funds'
    },
    {
      class: 'String',
      name: 'taxIdentificationNumber',
      documentation: 'Tax identification number associated to business user.'
    },
    {
      class: 'String',
      name: 'signUpToken',
      storageTransient: true,
      documentation: `
        This is set to a random UUID that's used to let users sign up to the
        platform from an email link. If you sign up by clicking on a sign up
        link in an email with a token, when creating the User, this property
        will be set to the token so that backend can verify your email for
        you and associate you with the contact that was created when inviting
        you.
      `
    },
    {
      name: 'type',
      class: 'String',
      visibility: 'RO',
      storageTransient: true,
      getter: function() {
         return this.cls_.name;
      },
      javaGetter: `
    return getClass().getSimpleName();
      `
    },
    {
      class: 'Boolean',
      name: 'deleted',
      documentation: 'Indicates deleted user.',
      value: false,
      permissionRequired: true
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      documentation: 'User\' profile picture.',
      view: {
        class: 'foam.nanos.auth.ProfilePictureView',
        placeholderImage: 'images/ic-placeholder.png'
      }
    }
  ],
  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public User findUser(X x, long userId) {
              DAO bareUserDAO = (DAO) x.get("bareUserDAO");
              DAO contactDAO = (DAO) x.get("contactDAO");
              DAO businessDAO = (DAO) x.get("businessDAO");
              User user = null;
              Contact contact = null;
              try{
                contact = (Contact) contactDAO.find(userId);
                if ( contact != null && contact.getBusinessId() == 0 ) {
                  user = (User) bareUserDAO.find(AND(
                    EQ(User.EMAIL, contact.getEmail()),
                    NOT(INSTANCE_OF(Contact.class))));
                  if ( user == null ) { // when a real user is not present the the transaction is to an external user.
                    user = contact;
                  }
                } else if ( contact != null && contact.getBusinessId() > 0 ){
                  user = (User) businessDAO.find(contact.getBusinessId());
                } else {
                  user = (User) bareUserDAO.find(userId);
                }
              } catch(Exception e) {
                e.printStackTrace();
              }
              return user;
            }
        `);
      }
    }
  ]
});
