/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidCapability',
  extends: 'foam.nanos.crunch.Capability',

  properties: [
    {
      name: 'id',
      class: 'String',
      updateMode: 'RO'
    }, 
    {
      name: 'wasDirectlyAssigned',
      class: 'Boolean'
    },
    {
      name: 'of',
      javaFactory: ` return net.nanopay.liquidity.crunch.AccountTemplate.getOwnClassInfo(); `,
      hidden: true,
      documentation: `
      Class of the information stored in data field of UserCapabilityJunctions, if there is any.
      In this case, it is always a list of Longs representing accountIds, and we should restrict users from accessing this property
      `
    },
    // BELOW THIS ARE PROPERTIES NOT REALLY NEEDED IN LIQUIDCAPABILITY
    // WE SHOULD RESTRICT USERS FROM ACCESSING THESE PROPERTIES 
    {
      name: 'permissionsGranted',
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
  ],
});


foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'AccountBasedLiquidCapability',
  extends: 'net.nanopay.liquidity.crunch.LiquidCapability',

  javaImports: [
    'foam.nanos.auth.User',
     'foam.nanos.crunch.UserCapabilityJunction',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    { class: 'Boolean', name: 'canViewAccount' },
    { class: 'Boolean', name: 'canMakeAccount' },
    { class: 'Boolean', name: 'canApproveAccount' },
    { class: 'Boolean', name: 'canViewTransaction' },
    { class: 'Boolean', name: 'canMakeTransaction' },
    { class: 'Boolean', name: 'canApproveTransaction' },
    { class: 'Boolean', name: 'canMakeUsercapabilityjunction' }, // global role vs. account role maker/approver may be implied by whether there
    { class: 'Boolean', name: 'canApproverUsercapabilityjunction' }, //
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
        String[] permissionComponents = permission.split(".");
        if ( permissionComponents.length != 2 ) {
          // the permission string was not generated properly, should never happen
          return false;
        }
        String permissionStr = permissionComponents[0];
        Long outgoingAccountId = Long.parseLong(permissionComponents[1]);

        if ( (Boolean) getProperty(permissionStr) ) {
          UserCapabilityJunction ucj = (UserCapabilityJunction) ((DAO) x.get("userCapabilityJunctionDAO")).find(AND(
            EQ(UserCapabilityJunction.SOURCE_ID, ((User) x.get("user")).getId()),
            EQ(UserCapabilityJunction.TARGET_ID, getId())
          ));
          if ( ucj == null ) return false;

          AccountTemplate template = (AccountTemplate) ucj.getData();
          if ( template == null ) return false;

          return template.isParentOf(x, outgoingAccountId);
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

  properties: [
    { class: 'Boolean', name: 'canViewRule' },
    { class: 'Boolean', name: 'canMakeRule' },
    { class: 'Boolean', name: 'canApproveRule' },
    { class: 'Boolean', name: 'canViewUser' },
    { class: 'Boolean', name: 'canMakeUser' },
    { class: 'Boolean', name: 'canApproveUser' },
    { class: 'Boolean', name: 'canViewLiquiditysetting' },
    { class: 'Boolean', name: 'canMakeLiquiditysetting' },
    { class: 'Boolean', name: 'canApproveLiquiditysetting' },
    { class: 'Boolean', name: 'canViewCapability' },
    { class: 'Boolean', name: 'canMakerCapability' },
    { class: 'Boolean', name: 'canApproveCapability' },
    { class: 'Boolean', name: 'canMakeUsercapabilityjunction' }, // global role vs. account role maker/approver may be implied by whether there
    { class: 'Boolean', name: 'canApproverUsercapabilityjunction' }, //
  ],

  methods: [
    {
      name: 'implies',
      documentation: `
      Takes a permission string generated from the LiquidAuthorizer in the form of any of the boolean property names above.
      Returns true if that boolean is true.
      `,
      javaCode: `
        return (Boolean) getProperty(permission);
      `
    },
  ]
});


