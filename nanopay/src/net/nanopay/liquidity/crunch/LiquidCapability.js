foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidCapability',
  extends: 'foam.nanos.crunch.Capability',

  implements: [
    'net.nanopay.liquidity.approvalRequest.ApprovableAware'
  ],

  tableColumns: [ 'id' ],

  sections: [
    {
      name: 'uiSettings',
      isAvailable: () => false
    },
    {
      name: 'capabilityRelationships',
      isAvailable: () => false
    }
  ],

  properties: [
    {
      name: 'id',
      label: 'Name',
      class: 'String'
    },
    // BELOW THIS ARE PROPERTIES NOT REALLY NEEDED IN LIQUIDCAPABILITY
    // WE SHOULD RESTRICT USERS FROM ACCESSING THESE PROPERTIES 
    {
      name: 'permissionsGranted',
      hidden: true,
    },
    {
      name: 'description',
      hidden: true,
    },
    {
      name: 'icon',
      hidden: true,
    },
    {
      name: 'version',
      hidden: true,
    },
    {
      name: 'enabled',
      hidden: true,
    },
    {
      name: 'visible',
      hidden: true,
    },
    {
      name: 'expiry',
      hidden: true,
    },
    {
      name: 'duration',
      hidden: true,
    },
    {
      name: 'daoKey',
      hidden: true,
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      value: foam.nanos.auth.LifecycleState.ACTIVE,
      hidden: true
    }
  ],

  methods: [
    {
      name: 'getApprovableKey',
      type: 'String',
      javaCode: `
        return getId();
      `
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'AccountBasedLiquidCapability',
  extends: 'net.nanopay.liquidity.crunch.LiquidCapability',

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.dao.DAO',
    'foam.core.X',
    'static foam.mlang.MLang.*',
    'java.util.List',
    'java.util.ArrayList',
    'java.util.Arrays'
  ],

  tableColumns: [
    'id'
  ],

  properties: [
    { class: 'Boolean', name: 'canViewAccount' },
    { class: 'Boolean', name: 'canMakeAccount' },
    { class: 'Boolean', name: 'canApproveAccount' },
    { class: 'Boolean', name: 'canViewTransaction' },
    { class: 'Boolean', name: 'canMakeTransaction' },
    { class: 'Boolean', name: 'canApproveTransaction' },
    {
      name: 'of',
      hidden: true,
      documentation: `
      Class of the information stored in data field of UserCapabilityJunctions, if there is any.
      In this case, it is always a list of Longs representing accountIds, and we should restrict users from accessing this property
      `
    },
    {
      name: 'permissionsGranted',
      javaFactory: `
        List<String> permissions = new ArrayList<String>();

        // add dashboard menu permission for account maker/approver
        if ( getCanMakeAccount() && getCanApproveAccount() ) permissions.add("menu.read.liquid.dashboard");

        // add account menu permission if user can view, make or approve account
        if ( getCanViewAccount() || getCanMakeAccount() || getCanApproveAccount() ) permissions.add("menu.read.liquid.accounts");

        // add approver menu permission for approvers
        if ( getCanApproveTransaction() || getCanApproveAccount() ) permissions.add("menu.read.liquid.approvals");

        if ( getCanMakeAccount() ) permissions.add("account.make");
        if ( getCanMakeTransaction() ) permissions.add("transaction.make");

        // add transaction menu permission if user can view, make or approve transaction
        if ( getCanViewTransaction() || getCanMakeTransaction() || getCanApproveTransaction() ) permissions.add("menu.read.liquid.transactions");

        return permissions.size() > 0 ? permissions.toArray(new String[0]) : null;
      `
    }
  ],

  methods: [
    {
      name: 'implies',
      documentation: `
      Takes a permission string in the form of "booleanPropertyName.outgoingAccountId", and 
      checks if the boolean property is checked.
      If so, find the ucj and check if the outgoingAccountId is in the accountTemplate map or a child of
      an account in the accountTemplate map stored in the ucj.
      `,
      javaCode: `
        if ( Arrays.asList(getPermissionsGranted()).contains(permission) ) return true;

        try {
          String[] permissionComponents = permission.split("\\\\.");
          if ( permissionComponents.length != 3 ) {
            // the permission string was not generated properly, should never happen
            return false;
          }
          String permObj = permissionComponents[0];
          String permOperation = permissionComponents[1];
          String outgoingAccountId = permissionComponents[2];

          String permToProperty = "can" + permOperation.substring(0, 1).toUpperCase() + permOperation.substring(1) + permObj.substring(0, 1).toUpperCase() + permObj.substring(1);

          if ( (Boolean) getProperty(permToProperty) ) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) ((DAO) x.get("userCapabilityJunctionDAO")).find(AND(
              EQ(UserCapabilityJunction.SOURCE_ID, ((User) x.get("user")).getId()),
              EQ(UserCapabilityJunction.TARGET_ID, getId())
            ));
            if ( ucj == null ) return false;

            foam.core.FObject ucjdata =  (foam.core.FObject) ucj.getData();
            if ( ucjdata == null || ! ( ucjdata instanceof AccountApproverMap ) ) return false;

            AccountApproverMap map = (AccountApproverMap) ucjdata;
            if ( map.hasAccount(x, Long.parseLong(outgoingAccountId)) ) return true;
          }
        } catch ( java.lang.Exception e ) {
          return false;
        }

        return false;
      `
    },
  ]
});


foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'GlobalLiquidCapability',
  extends: 'net.nanopay.liquidity.crunch.LiquidCapability',

  javaImports: [
    'java.util.List',
    'java.util.ArrayList',
    'java.util.Arrays'
  ],

  tableColumns: [
    'id'
  ],

  properties: [
    { class: 'Boolean', name: 'canViewRule' },
    { class: 'Boolean', name: 'canMakeRule' },
    { class: 'Boolean', name: 'canApproveRule' },
    { class: 'Boolean', name: 'canViewUser' },
    { class: 'Boolean', name: 'canMakeUser' },
    { class: 'Boolean', name: 'canApproveUser' },
    { class: 'Boolean', name: 'canViewLiquiditysettings' },
    { class: 'Boolean', name: 'canMakeLiquiditysettings' },
    { class: 'Boolean', name: 'canApproveLiquiditysettings' },
    { class: 'Boolean', name: 'canViewCapability' },
    { class: 'Boolean', name: 'canMakeCapability' },
    { class: 'Boolean', name: 'canApproveCapability' },
    { class: 'Boolean', name: 'canMakeCapabilityrequest' }, // global role vs. account role maker/approver may be implied by whether there
    { class: 'Boolean', name: 'canApproveCapabilityrequest' },
    { class: 'Boolean', name: 'canIngestFile' },
    {
      name: 'of',
      javaFactory: ` return net.nanopay.liquidity.crunch.ApproverLevel.getOwnClassInfo(); `,
      hidden: true,
      documentation: `
      Class of the information stored in data field of UserCapabilityJunctions, if there is any.
      In this case, it is an Integer representing approver level, or 0 if the capability does not grant 
      an approver role.
      `
    },
    {
      name: 'permissionsGranted',
      javaFactory: `
        List<String> permissions = new ArrayList<String>();

        // add approver menu permission for approvers
        if ( getCanApproveRule() || getCanApproveUser() || getCanApproveLiquiditysettings() || getCanApproveCapability() || getCanApproveCapabilityrequest() ) permissions.add("menu.read.liquid.approvals");

        // add rules menu permission if user can view, make or approve rules
        if ( getCanViewRule() || getCanMakeRule() || getCanApproveRule() ) permissions.add("menu.read.liquid.rules");

        // add user menu permission if user can view, make or approve user
        if ( getCanViewUser() || getCanMakeUser() || getCanApproveUser() ) permissions.add("menu.read.liquid.users");

        // add liquidity settings menu permission if user can view, make or approve liquidity settings
        if( getCanViewLiquiditysettings() || getCanMakeLiquiditysettings() || getCanApproveLiquiditysettings() ) permissions.add("menu.read.liquid.liquidity");

        // add roles, global liquid capabilities and account based liquid capabilities menu permission if user can view, make or approve a capability
        if ( getCanViewCapability() || getCanMakeCapability() || getCanApproveCapability() ) {
          permissions.add("menu.read.liquid.roles");
          permissions.add("menu.read.liquid.globalliquidcapabilities");
          permissions.add("menu.read.liquid.accountbasedliquidcapabilities");
        }

        // add assign capability menu permission if user can make or approve a capability request
        if ( getCanMakeCapabilityrequest() || getCanApproveCapabilityrequest() ) permissions.add("menu.read.liquid.assigncapability");

        // add capability account template menu permission if user can make or approve capability requests
        if ( getCanMakeCapabilityrequest() || getCanApproveCapabilityrequest() ) permissions.add("menu.read.liquid.capabilityaccounttemplates");

        // add role query view menu permission if user can view capability, user and account
        if ( getCanViewCapability() && getCanViewUser() ) permissions.add("menu.read.liquid.rolequeryview");

        // add file upload permission for file ingesters
        if ( getCanIngestFile() ) permissions.add("menu.read.liquid.fileupload");

        if ( getCanMakeRule() ) permissions.add("rule.make");
        if ( getCanMakeUser() ) permissions.add("user.make");
        if ( getCanMakeLiquiditysettings() ) permissions.add("liquiditysettings.make");
        if ( getCanMakeCapability() ) permissions.add("capability.make");

        return permissions.size() > 0 ? permissions.toArray(new String[0]) : null;
      `
    }
  ],

  methods: [
    {
      name: 'implies',
      documentation: `
      Takes a permission string generated from the LiquidAuthorizer in the form of any of the boolean property names above.
      Returns true if that boolean is true.
      `,
      javaCode: `
        if ( Arrays.asList(getPermissionsGranted()).contains(permission) ) return true;

        try {
          String[] permissionComponents = permission.split("\\\\.");
          if ( permissionComponents.length != 2 ) {
            // the permission string was not generated properly, should never happen
            return false;
          }
          String permObj = permissionComponents[0];
          String permOperation = permissionComponents[1];

          String permToProperty = "can" + permOperation.substring(0, 1).toUpperCase() + permOperation.substring(1) + permObj.substring(0, 1).toUpperCase() + permObj.substring(1);

          return (Boolean) getProperty(permToProperty);
        } catch ( java.lang.Exception e ) {
          return false;
        }
      `
    },
  ]
});

