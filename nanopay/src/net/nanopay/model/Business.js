foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Business',
  extends: 'foam.nanos.auth.User',

  documentation: 'Business extends user class & it is the company user for SME',

  properties: [
    {
      class: 'String',
      name: 'businessPermissionId',
      documentation: `
        A generated name that doesn't contain any special characters. Used in
        permission strings related to the business.
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
      value: false
    },
    {
      class: 'Boolean',
      name: 'residenceOperated',
      documentation: 'Details whether business is operated in the owners residence.'
    }
  ],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil'
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

        // Prevent everyone but admins from changing the 'system' property.
        if ( this.getSystem() && ! user.getGroup().equals("admin") ) {
          throw new AuthorizationException("You do not have permission to create a system user.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        // Don't authorize reads for now.
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
          ! hasUserEditPermission &&
          ! user.getSystem()
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

        // Prevent everyone but admins from changing the 'system' property.
        if (
          ! SafetyUtil.equals(oldBusiness.getSystem(), this.getSystem()) &&
          ! SafetyUtil.equals(user.getGroup(), "admin")
        ) {
          throw new AuthorizationException("You do not have permission to change the 'system' flag.");
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        User user = (User) x.get("user");
        if ( ! SafetyUtil.equals(user.getGroup(), "admin") ) {
          throw new AuthorizationException("Businesses cannot be deleted.");
        }
      `
    }
  ],

  actions: [
    {
      name: 'exportComplianceDocuments',
      code: async function() {
        var url = window.location.origin + "/service/ascendantFXReports?userId=" + this.id;
        window.location.assign(url);
      }
    },
    {
      name: 'exportSettlementDocuments',
      code: async function() {
        // Let us assume that we want to search for invoices with a field 3 days before and 3 days after a specified invoice
        // var inv = await this.invoiceDAO.find(1); // Reminder import invoiceDAO
        // var sDate = inv.paymentDate.getTime() - (1000*60*60*24*3);
        // var dDate = inv.paymentDate.getTime() + (1000*60*60*24*3);
        // var url = window.location.origin + "/service/settlementReports?userId=" + this.id + "&startDate="+sDate+"&endDate="+dDate;
        var url = window.location.origin + "/service/settlementReports?userId=" + this.id + "&startDate=&endDate=";
        window.location.assign(url);
      }
    }
  ]
});
