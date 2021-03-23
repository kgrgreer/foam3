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
  package: 'net.nanopay.model',
  name: 'Business',
  plural: 'Businesses',
  extends: 'foam.nanos.auth.User',

  implements: [
    'foam.core.Validatable',
    'foam.nanos.auth.Authorizable'
  ],

  imports: [
    'ctrl',
    'invoiceDAO'
  ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.admin.model.ComplianceStatus',
  ],

  documentation: `Business is an object that extends the user class. A business is an
    entity on behalf of which multiple users can act.  A business is associated with
    the company name provided by the user upon registraton. The business object allows
    business information to be updated and retrieved.  The body parameters refer to
    the business as the 'organization'.
  `,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.nanos.notification.NotificationSetting',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.List',

    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.model.BusinessUserJunction',
    'static foam.mlang.MLang.*'
  ],

  tableColumns: [
    'id',
    'businessName',
    'compliance',
    'viewAccounts'
  ],

  messages: [
    { name: 'COMPLIANCE_REPORT_WARNING', message: ' has not completed the business profile, and cannot generate compliance documents' }
  ],

  sections: [
    {
      name: 'businessInformation',
      order: 1
    },
    {
      name: 'userInformation',
      order: 2,
      permissionRequired: true
    }
  ],

  properties: [
    {
      name: 'id',
      section: 'businessInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'businessName',
      documentation: 'Legal name of business.',
      includeInDigest: true,
      section: 'businessInformation',
      order: 20,
      width: 50
    },
    {
      class: 'Boolean',
      name: 'holdingCompany',
      documentation: `Determines whether a Business is a holding company.  A holding c2ompany
        represent a corporate group which owns shares of multiple companies.`,
      includeInDigest: false,
      section: 'businessInformation',
      order: 30,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'operatingBusinessName',
      label: 'Company',
      documentation: `The business name displayed to the public. This may differ
        from the organization name.`,
          // Is displayed on client if present taking place of organziation name.
      includeInDigest: false,
      section: 'businessInformation',
      order: 40,
      gridColumns: 6
    },
    {
      name: 'type',
      section: 'businessInformation',
      includeInDigest: false,
      order: 50,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'issuingAuthority',
      transient: true,
      documentation: 'An organization that has the power to issue an official document.',
      getter: function() {
        return this.businessRegistrationAuthority;
      },
      setter: function(x) {
        this.businessRegistrationAuthority = x;
      },
      javaGetter: `return getBusinessRegistrationAuthority();`,
      javaSetter: `setBusinessRegistrationAuthority(val);`,
      section: 'businessInformation',
      order: 60,
      gridColumns: 6
    },
    {
      class: 'Reference',
      targetDAOKey: 'businessSectorDAO',
      name: 'businessSectorId',
      of: 'net.nanopay.model.BusinessSector',
      documentation: 'The ID of the general economic grouping for the business.',
      includeInDigest: true,
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
      },
      section: 'businessInformation',
      order: 70,
      gridColumns: 6
    },
    {
      class: 'Reference',
      targetDAOKey: 'businessTypeDAO',
      name: 'businessTypeId',
      of: 'net.nanopay.model.BusinessType',
      documentation: 'The ID of the proprietary details of the business.',
      includeInDigest: true,
      section: 'businessInformation',
      order: 80,
      gridColumns: 6
    },
    {
      name: 'businessIdentificationCode',
      documentation: 'ISO 9362 Business Identification Code (BIC) (regulated by SWIFT). see https://en.wikipedia.org/wiki/ISO_9362.',
      class: 'String',
      includeInDigest: true,
      section: 'businessInformation',
      order: 90,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'businessIdentificationNumber',
      transient: true,
      documentation: `The Business Identification Number (BIN) that identifies your business
        to federal, provincial or municipal governments and is used by the business
        for tax purposes. This number is typically issued by an Issuing Authority such as
        the CRA.`,
      includeInDigest: false,
      getter: function() {
        return this.businessRegistrationNumber;
      },
      setter: function(x) {
        this.businessRegistrationNumber = x;
      },
      javaGetter: `return getBusinessRegistrationNumber();`,
      javaSetter: `setBusinessRegistrationNumber(val);`,
      section: 'businessInformation',
      order: 100,
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'countryOfBusinessRegistration',
      documentation: `Country where business was registered.`,
      includeInDigest: true,
      section: 'businessInformation',
      order: 110,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'businessRegistrationAuthority',
      documentation: `An organization that has the power to issue and process a
        business registration.`,
      includeInDigest: false,
      width: 35,
      validateObj: function(businessRegistrationAuthority) {
        var re = /^[a-zA-Z0-9 ]{1,35}$/;
        if ( businessRegistrationAuthority.length > 0 &&
            ! re.test(businessRegistrationAuthority) ) {
          return 'Invalid issuing authority.';
        }
      },
      section: 'businessInformation',
      order: 120,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'businessRegistrationNumber',
      width: 35,
      documentation: `The Business Registration Number (BRN) that identifies your business
        to federal, provincial or municipal governments and is used by the business
        for tax purposes. This number is typically issued by an Issuing Authority such as
        the CRA.`,

      includeInDigest: true,
      validateObj: function(businessRegistrationNumber) {
        var re = /^[a-zA-Z0-9 ]{1,35}$/;
        if ( businessRegistrationNumber.length > 0 &&
              ! re.test(businessRegistrationNumber) ) {
          return 'Invalid registration number.';
        }
      },
      section: 'businessInformation',
      order: 130,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'publiclyTraded',
      includeInDigest: false,
      section: 'businessInformation',
      order: 140,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'taxIdentificationNumber',
      documentation: `The tax identification number associated with the business of
      the User.`,
      includeInDigest: true,
      section: 'businessInformation',
      order: 150,
      gridColumns: 6
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      label: 'Commercial Address',
      documentation: `Returns the postal address of the business associated with the
        User from the Address model.`,
      includeInDigest: false,
      section: 'businessInformation',
      order: 160,
      factory: function() {
        return this.Address.create();
      },
      validationPredicates: [
        {
          args: ['address', 'address$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.model.Business.ADDRESS
              }), true);
          },
          errorString: 'Invalid address.'
        }
      ],
      view: function(_, X) {
        return {
          class: 'net.nanopay.sme.ui.AddressView'
        };
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'mailingAddress',
      documentation: `Mailing address of business`,
      includeInDigest: false,
      section: 'businessInformation',
      order: 180,
      factory: function() {
        return this.Address.create();
      },
      validationPredicates: [
        {
          args: ['address', 'address$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.model.Business.ADDRESS
              }), true);
          },
          errorString: 'Invalid address.'
        }
      ],
      view: function(_, X) {
        return {
          class: 'net.nanopay.sme.ui.AddressView'
        };
      }
    },
    {
      class: 'PhoneNumber',
      name: 'phoneNumber',
      documentation: 'The phone number of the business.',
      includeInDigest: false,
      section: 'businessInformation',
      order: 190,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'phoneNumberVerified',
      writePermissionRequired: true,
      includeInDigest: false,
      section: 'businessInformation',
      order: 195,
      gridColumns: 6
    },
    {
      class: 'PhoneNumber',
      name: 'fax',
      documentation: 'The fax number of the business.',
      includeInDigest: false,
      section: 'businessInformation',
      order: 200,
      gridColumns: 6
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'businessProfilePicture',
      documentation: `The profile picture of the business, such as a logo, initially
        defaulting to a placeholder picture.`,
      includeInDigest: false,
      view: {
        class: 'foam.nanos.auth.ProfilePictureView',
        placeholderImage: 'images/business-placeholder.png'
      },
      section: 'businessInformation',
      order: 210,
      gridColumns: 6
    },
    {
      name: 'note',
      section: 'businessInformation',
      order: 220
    },
    {
      name: 'created',
      section: 'businessInformation',
      order: 230,
      gridColumns: 6
    },
    {
      name: 'createdBy',
      section: 'businessInformation',
      order: 240,
      gridColumns: 6
    },
    {
      name: 'createdByAgent',
      section: 'businessInformation',
      order: 245,
      gridColumns: 6
    },
    {
      name: 'lastModified',
      section: 'businessInformation',
      order: 250,
      gridColumns: 6
    },
    {
      name: 'lastModifiedBy',
      section: 'businessInformation',
      order: 260,
      gridColumns: 6
    },
    {
      name: 'lastModifiedByAgent',
      section: 'businessInformation',
      order: 260,
      gridColumns: 6
    },
    {
      name: 'email',
      section: 'businessInformation',
      order: 270,
      gridColumns: 6,
      includeInDigest: false,
      validateObj: function() {}
    },
    {
      name: 'website',
      section: 'businessInformation',
      order: 280,
      gridColumns: 6,
      includeInDigest: false,
    },
    {
      class: 'String',
      name: 'sourceOfFunds',
      documentation: 'The entities that provide funding to the business.',
      includeInDigest: false,
      section: 'complianceInformation',
      order: 60,
      gridColumns: 6
    },
    {
      class: 'FObjectProperty',
      name: 'suggestedUserTransactionInfo',
      of: 'net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo',
      documentation: `Returns the expected transaction types, frequency, amount and
        currencies that the User anticipates making with the platform. This
        information is required for KYC purposes.  It is drawn from the
        suggestedUserTransactionInfo object.
        `,
      includeInDigest: false,
      section: 'complianceInformation',
      order: 70,
      factory: function() {
        return net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.create({}, this);
      },
      view: function(_, X) {
        return foam.u2.detail.SectionView.create({
          sectionName: 'backOfficeSuggestedUserTransactionInfo'
        }, X);
      }
    },
    {
      class: 'String',
      name: 'targetCustomers',
      label: 'Describe the target customer of your products and services',
      documentation: `The type of clients that the business markets its products and services.`,
      includeInDigest: false,
      section: 'complianceInformation',
      order: 110,
      gridColumns: 6
    },
    {
      class: 'Date',
      name: 'businessRegistrationDate',
      documentation: 'The date that the business was registered by their issuing authority.',
      includeInDigest: true,
      section: 'complianceInformation',
      order: 120,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'onboarded',
      documentation: `Determines whether completed business registration. This property
        dictates portal views after compliance and account approval.`,
      value: false,
      includeInDigest: false,
      writePermissionRequired: true,
      section: 'operationsInformation',
      order: 1,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'internationalPaymentEnabled',
      value: false,
      documentation: `Determines whether a user has been onboarded to
        a partner platform to support international payments.`,
      includeInDigest: false,
      section: 'operationsInformation',
      order: 2,
      gridColumns: 6
    },
    {
      name: 'organization',
      section: 'ownerInformation',
      order: 10,
      gridColumns: 6
    },
    {
      name: 'department',
      section: 'ownerInformation',
      order: 20
    },
    {
      name: 'jobTitle',
      section: 'ownerInformation',
      order: 30
    },
    {
      class: 'FObjectArray',
      name: 'businessDirectors',
      of: 'net.nanopay.model.BusinessDirector',
      includeInDigest: false,
      section: 'ownerInformation',
      order: 40
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'beneficialOwnerDocuments',
      documentation: `A stored copy of the documents that verify a person as a beneficial owner.`,
      view: function(_, X) {
        return {
          class: 'net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView',
          documents$: X.data.beneficialOwnerDocuments$
        };
      },
      section: 'ownerInformation',
      order: 60,
      includeInDigest: false
    },
    // REVIEW: includeInDigest - many of the following are UCJ entries on the
    // business, or will be, hence marked as false - assuming they will move.
    {
      class: 'FObjectArray',
      of: 'foam.nanos.auth.User',
      name: 'principalOwners',
      documentation: 'Represents the people who own the majority shares in a business.',
      includeInDigest: false,
      view: { class: 'foam.u2.view.DAOtoFObjectArrayView' },
      createVisibility: 'HIDDEN',
      section: 'ownerInformation',
      order: 70
    },
    {
      name: 'businessesInWhichThisUserIsASigningOfficer',
      section: 'ownerInformation',
      order: 80,
      hidden: true
    },
    {
      name: 'agents',
      section: 'ownerInformation',
      order: 90
    },
    {
      name: 'entities',
      section: 'ownerInformation',
      order: 100,
      hidden: true
    },
    {
      name: 'additionalDocuments',
      section: 'ownerInformation',
      order: 110,
      includeInDigest: false,
    },
    {
      class: 'Boolean',
      name: 'residenceOperated',
      documentation: 'Determines whether a business is operated at the residence of the owner.',
      section: 'ownerInformation',
      order: 120,
      gridColumns: 6
    },
    {
      //TODO/REVIEW: should be storageTransient
      class: 'String',
      name: 'businessPermissionId',
      documentation: `A generated name used in permission strings related to the business.
        The name does not contain any special characters.
      `,
      includeInDigest: false,
      expression: function(businessName, id) {
        return businessName.replace(/\W/g, '').toLowerCase() + id;
      },
      type: 'String',
      javaGetter: `
        return getBusinessName().replaceAll("\\\\W", "").toLowerCase() + getId();
      `,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'systemInformation',
      order: 20,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'businessHoursEnabled',
      documentation: 'Determines whether business hours are enabled for the User to set.',
      value: false,
      includeInDigest: false,
      section: 'systemInformation',
      order: 100,
      gridColumns: 6
    },
    // Overwrite validateObj on firstName, lastName, and email so we can create
    // businesses through the GUI.
    {
      class: 'Boolean',
      name: 'loginEnabled',
      documentation: 'Determines whether the User can login to the platform.',
      value: false,
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'emailVerified',
      value: true,
      hidden: true
    },
    {
      class: 'Password',
      name: 'desiredPassword',
      hidden: true,
    },
    {
      class: 'DateTime',
      name: 'passwordLastModified',
      hidden: true,
    },
    {
      class: 'DateTime',
      name: 'passwordExpiry',
      hidden: true
    },
    {
      name: 'firstName',
      hidden: true,
      validateObj: function() {},
    },
    {
      name: 'lastName',
      hidden: true,
      validateObj: function() {}
    }
 ],

  methods: [
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        if ( SafetyUtil.isEmpty(this.getBusinessName()) ) {
          throw new IllegalStateException("Business name cannot be empty.");
        }
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        boolean hasUserCreatePermission = auth.check(x, "business.create");

        if ( ! hasUserCreatePermission ) {
          throw new AuthorizationException("You do not have permission to create a business.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        Subject subject = (Subject) x.get("subject");
        User user = subject.getUser();
        User agent = subject.getRealUser();

        if ( user == null ) throw new AuthenticationException();

        // If the user has the appropriate permission, allow access.
        if ( auth.check(x, "business.read." + Long.toString(this.getId())) ) return;

        // Allow businesses to read themselves.
        if ( user instanceof Business && SafetyUtil.equals(this.getId(), user.getId())) return;
        DAO junctionDAO = user.getEntities(x).getJunctionDAO();

        // There are decorators on agentJunctionDAO that need to access
        // businessDAO, but this method needs to access agentJunctionDAO, so we
        // end up with a loop where the two call each other until the call stack
        // overflows. In order to get around that, we skip all of the decorators
        // on agentJunctionDAO, which is what the line below is doing. We could
        // have made a second, undecorated service instead, but then it would be
        // easily for developers to mistakenly use the undecorated service in
        // places where it shouldn't be used.
        while ( junctionDAO instanceof ProxyDAO ) junctionDAO = ((ProxyDAO) junctionDAO).getDelegate();

        // Create a dummy object so we can search by its composite id.
        UserUserJunction dummy = new UserUserJunction.Builder(x).setSourceId(agent != null ? agent.getId() : user.getId()).setTargetId(this.getId()).build();

        UserUserJunction junction = (UserUserJunction) junctionDAO.inX(x).find(dummy.getId());
        boolean userIsInBusiness = junction != null;

        // Allow users to read businesses they're in.
        if ( userIsInBusiness ) return;

        throw new AuthorizationException();
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");
        boolean isUpdatingSelf = SafetyUtil.equals(this.getId(), user.getId());

        // to allow update authorization for users with permissions
        boolean hasUserEditPermission = auth.check(x, "business.update." + this.getId());

        // In other words: if the user EITHER is updating themselves, has edit authorization or is changing the system (will be handled below)
        // then they can PROCEED
        if (
          ! isUpdatingSelf &&
          ! hasUserEditPermission
        ) {
          throw new AuthorizationException();
        }

        Business oldBusiness = (Business) oldObj;

        // Prevent privilege escalation by only allowing a user's group to be
        // changed under appropriate conditions.
        if ( ! SafetyUtil.equals(oldBusiness.getGroup(), this.getGroup()) ) {
          boolean hasOldGroupUpdatePermission = auth.check(x, "group.update." + oldBusiness.getGroup());
          boolean hasNewGroupUpdatePermission = auth.check(x, "group.update." + this.getGroup());
          if ( isUpdatingSelf ) {
            throw new AuthorizationException("You cannot change your own group.");
          } else if ( ! (hasOldGroupUpdatePermission && hasNewGroupUpdatePermission) ) {
            throw new AuthorizationException("You do not have permission to change that business's group to '" + this.getGroup() + "'.");
          }
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        Group group = (Group) x.get("group");
        if ( ! SafetyUtil.equals(group.getId(), "admin") &&
            ! SafetyUtil.equals(group.getId(), user.getSpid() + "-admin") ) {
          throw new AuthorizationException("Businesses cannot be deleted.");
        }
      `
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function toSummary() {
        if ( this.operatingBusinessName ) return this.operatingBusinessName;
        if ( this.organization ) return this.organization;
        if ( this.businessName ) return this.businessName;
        if ( this.legalName ) return this.legalName;
        return this.userName;
      },
      javaCode: `
        if ( ! SafetyUtil.isEmpty(this.getOperatingBusinessName()) ) return this.getOperatingBusinessName();
        if ( ! SafetyUtil.isEmpty(this.getOrganization()) ) return this.getOrganization();
        if ( ! SafetyUtil.isEmpty(this.getBusinessName()) ) return this.getBusinessName();
        if ( ! SafetyUtil.isEmpty(this.getLegalName()) ) return this.getLegalName();
        return this.getUserName();
      `
    },
    {
      name: 'doNotify',
      javaCode: `
        DAO       agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
        DAO notificationSettingDAO = (DAO) x.get("notificationSettingDAO");
        DAO                userDAO = (DAO) x.get("localUserDAO");
        Logger              logger = (Logger) x.get("logger");

        // Gets all the business-user pairs
        List<UserUserJunction> businessUserJunctions = ((ArraySink) agentJunctionDAO
          .where(AND(
            EQ(UserUserJunction.TARGET_ID, getId()),
            EQ(UserUserJunction.GROUP, getGroup())))
          .select(new ArraySink())).getArray();

        for( UserUserJunction businessUserJunction : businessUserJunctions ) {
          User businessUser = (User) userDAO.find(businessUserJunction.getSourceId());
          if ( businessUser == null ) {
            logger.warning("A business user junction for business ", businessUserJunction.getTargetId(), "  and user ", businessUserJunction.getSourceId(), " exists, but the user cannot be found.");
            continue;
          }

          // Get the default settings for the user if none are already defined
          List<NotificationSetting> settingDefaults = ((ArraySink) ((DAO) x.get("notificationSettingDefaultsDAO"))
            .where(EQ(foam.nanos.notification.NotificationSetting.SPID, getSpid()))
            .select(new ArraySink()))
            .getArray();
          HashMap<String, NotificationSetting> settingsMap = new HashMap<String, NotificationSetting>();
          for ( NotificationSetting setting : settingDefaults ) {
            settingsMap.put(setting.getClassInfo().getId(), setting);
          }

          // Gets the notification settings for this business-user pair
          List<NotificationSetting> userSettings = ((ArraySink) businessUserJunction.getNotificationSettingsForUserUsers(x).select(new ArraySink())).getArray();
          for ( NotificationSetting setting : userSettings ) {
            settingsMap.put(setting.getClassInfo().getId(), setting);
          }

          for ( NotificationSetting setting : settingsMap.values() ) {
            setting.doNotify(x, businessUser, notification);
          }
        }
      `
    },
    {
      name: 'findSigningOfficer',
      type: 'User',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        DAO userDAO = (DAO) x.get("userDAO");
        DAO signingOfficerJunctionDAO = (DAO) x.get("signingOfficerJunctionDAO");

        List signingOfficers = ((ArraySink) signingOfficerJunctionDAO.where(
            EQ(BusinessUserJunction.SOURCE_ID, this.getId())
          ).select(new ArraySink())).getArray();
        if ( signingOfficers == null || signingOfficers.size() == 0 ) {
          throw new RuntimeException("Signing officer not found");
        }
        BusinessUserJunction businessUserJunction = (BusinessUserJunction) signingOfficers.get(0);
        User user = (User) userDAO.find(businessUserJunction.getTargetId());

        return user;
      `
    },
    {
      name: 'validateAuth',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        // check if business is enabled
        if ( ! this.getEnabled() && AccountStatus.DISABLED == this.getStatus()) {
          throw new AuthenticationException("Business disabled");
        }

        if ( this instanceof LifecycleAware && ((LifecycleAware) this).getLifecycleState() != LifecycleState.ACTIVE ) {
          throw new AuthenticationException("Business is not active");
        }
      `
    }
  ],

  actions: [
    {
      name: 'exportComplianceDocuments',
      section: 'complianceInformation',
      isEnabled: function(compliance, onboarded) {
        return compliance !== this.ComplianceStatus.NOTREQUESTED && onboarded;
      },
      code: function() {
        var url = window.location.origin
          + '/service/ascendantFXReports?userId=' + this.id;
        window.location.assign(url);
      }
    },
    {
      name: 'exportSettlementDocuments',
      section: 'complianceInformation',
      code: function() {
        // Let us assume that we want to search for invoices with a field 3 days before and 3 days after today.
        var sDate = new Date(Date.now() - (1000*60*60*24*3));
        var dDate = new Date(Date.now() + (1000*60*60*24*3));
        var url = window.location.origin
          + '/service/settlementReports?'
          + 'startDate=' // + sDate <- add(uncomment) to use above set dates.
          + '&endDate='; // + dDate; <- add(uncomment) to use above set dates.
        window.location.assign(url);
      }
    }
  ]
});
