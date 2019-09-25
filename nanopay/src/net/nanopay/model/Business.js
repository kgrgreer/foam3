foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Business',
  extends: 'foam.nanos.auth.User',

  imports: [
    'ctrl',
    'invoiceDAO'
  ],

  requires: [
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  documentation: `Business is an object that extends the user class. A business is an
    entity on behalf of which multiple users can act.  A business is associated with
    the company name provided by the user upon registraton. The business object allows
    business information to be updated and retrieved.  The body parameters refer to
    the business as the 'organization'.
  `,

  tableColumns: [
    'id',
    'businessName',
    'email',
    'viewAccounts'
  ],

  messages: [
    { name: 'COMPLIANCE_REPORT_WARNING', message: ' has not completed the business profile, and cannot generate compliance documents.' }
  ],

  properties: [
    {
      class: 'String',
      name: 'businessPermissionId',
      documentation: `A generated name used in permission strings related to the business.
        The name does not contain any special characters.
      `,
      expression: function(businessName, id) {
        return businessName.replace(/\W/g, '').toLowerCase() + id;
      },
      type: 'String',
      javaGetter: `
        return getBusinessName().replaceAll("\\\\W", "").toLowerCase() + getId();
      `
    },
    {
      class: 'Boolean',
      name: 'loginEnabled',
      documentation: 'Determines whether the User can login to the platform.',
      value: false
    },
    {
      class: 'Boolean',
      name: 'residenceOperated',
      documentation: 'Determines whether a business is operated at the residence of the owner.'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'beneficialOwnerDocuments',
      documentation: `A stored copy of the documents that verify a person as a
        beneficial owner.`,
      view: function(_, X) {
        return {
          class: 'net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView',
          documents$: X.data.beneficialOwnerDocuments$
        };
      }
    },
    {
      class: 'Int',
      name: 'countQBO',
      documentation: 'the number of times that this business has synced to QuickBook Online.',
      label: 'Sync Count to QBO'
    },
    {
      class: 'Int',
      name: 'countXero',
      documentation: 'the number of times that this business has synced to Xero.',
      label: 'Sync Count to Xero'
    },
    {
      class: 'FObjectArray',
      name: 'businessDirectors',
      of: 'net.nanopay.model.BusinessDirector',
      view: {
        class: 'foam.u2.view.FObjectArrayView'
      }
    }
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.EQ'
  ],

  implements: [
    'foam.core.Validatable',
    'foam.nanos.auth.Authorizable'
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

        // Temporarily prohibit businesses based in Quebec.
        Address businessAddress = this.getBusinessAddress();

        if ( businessAddress != null && SafetyUtil.equals(businessAddress.getRegionId(), "QC") ) {
          throw new IllegalStateException("Ablii does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.");
        }
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        User user = (User) x.get("user");
        AuthService auth = (AuthService) x.get("auth");

        // Prevent privilege escalation by only allowing a user's group to be
        // set to one that the user doing the put has permission to update.
        boolean hasGroupUpdatePermission = auth.check(x, "group.update." + this.getGroup());

        if ( ! hasGroupUpdatePermission ) {
          throw new AuthorizationException("You do not have permission to set that business's group to '" + this.getGroup() + "'.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        User user = (User) x.get("user");
        User agent = (User) x.get("agent");

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
        User user = (User) x.get("user");
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
          } else if ( ! hasUserEditPermission ) {
            throw new AuthorizationException("You do not have permission to change that business's group.");
          } else if ( ! (hasOldGroupUpdatePermission && hasNewGroupUpdatePermission) ) {
            throw new AuthorizationException("You do not have permission to change that business's group to '" + this.getGroup() + "'.");
          }
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        User user = (User) x.get("user");
        Group group = (Group) x.get("group");
        if ( ! SafetyUtil.equals(group.getId(), "admin") ) {
          throw new AuthorizationException("Businesses cannot be deleted.");
        }
      `
    },
    {
      name: 'label',
      type: 'String',
      code: function label() {
        return this.organization || this.businessName || ( this.lastName ? this.firstName + ' ' + this.lastName : this.firstName );
      },
      javaCode: `
        if ( ! SafetyUtil.isEmpty(getOrganization()) ) return getOrganization();
        if ( ! SafetyUtil.isEmpty(getBusinessName()) ) return getBusinessName();
        if ( SafetyUtil.isEmpty(getLastName()) ) return getFirstName();
        return getFirstName() + " " + getLastName();
      `
    }
  ],

  actions: [
    {
      name: 'exportComplianceDocuments',
      code: function() {
        if ( this.compliance === this.ComplianceStatus.NOTREQUESTED
          || ! this.onboarded ) {
          this.ctrl.notify(this.organization + this.COMPLIANCE_REPORT_WARNING);
          return;
        }
        var url = window.location.origin
          + '/service/ascendantFXReports?userId=' + this.id;
        window.location.assign(url);
      }
    },
    {
      name: 'exportSettlementDocuments',
      code: function() {
        // Let us assume that we want to search for invoices with a field 3 days before and 3 days after today.
        var sDate = new Date(Date.now() - (1000*60*60*24*3));
        var dDate = new Date(Date.now() + (1000*60*60*24*3));
        var url = window.location.origin
          + '/service/settlementReports?userId='+ this.id
          + '&startDate=' // + sDate <- add(uncomment) to use above set dates.
          + '&endDate='; // + dDate; <- add(uncomment) to use above set dates.
        window.location.assign(url);
      }
    }
  ]
});
