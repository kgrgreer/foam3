/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidCapabilityAuthService',
  extends: 'foam.nanos.auth.CapabilityAuthService',
  documentation: ` 
  Liquid-specific implementation for checking if a user has a liquid capability
  `,

  implements: [
    'foam.nanos.auth.AuthService'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',
    'java.util.Date',
    'java.util.List',
    'foam.mlang.predicate.Predicate',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'checkUser',
      javaCode: `
        if ( x == null || permission == null ) return false;
        if ( x.get(Session.class) == null ) return false;
        if ( user == null || ! user.getEnabled() ) return false;

        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        DAO userCapabilityJunctionDAO = ((DAO) x.get("userCapabilityJunctionDAO")).where(EQ(UserCapabilityJunction.SOURCE_ID, user.getId()));

        // dissect the permission string
        String[] permissionComponents = permission.split(".");
        if ( permissionComponents.length != 3 ) {
          throw new RuntimeException("Invalid permission string");
        }
        String className = permissionComponents[0];
        String operation = permissionComponents[1];
        Object objId = new Object();
        try {
          objId = (Long) Long.parseLong((String) objId, 10);
        } catch (NumberFormatException e ) {
          objId = (String) objId; 
        }

        // check if we are looking for ucjs of global or accountbased liquidcapabilities
        // special case for usercapabilityjunction
        Boolean isGlobal = ! ( "account".equals(className) || "transaction".equals(className) );
        if ( "usercapabilityjunction".equals(className) ) {
          UserCapabilityJunction targetUcj = (UserCapabilityJunction) userCapabilityJunctionDAO.find(objId);
          Capability targetCapability = (Capability) capabilityDAO.find(targetUcj.getTargetId());
          isGlobal = (targetCapability instanceof GlobalLiquidCapability);
        }

        foam.mlang.predicate.Predicate pred = isGlobal ? INSTANCE_OF(GlobalLiquidCapability.getOwnClassInfo()) : INSTANCE_OF(AccountBasedLiquidCapability.getOwnClassInfo());
        
        DAO filteredUserCapabilityJunctionDAO = "usercapabilityjunction".equals(className) ? userCapabilityJunctionDAO : userCapabilityJunctionDAO.where(pred);

        List<UserCapabilityJunction> ucjs = (List<UserCapabilityJunction>) ((ArraySink) filteredUserCapabilityJunctionDAO.select(new ArraySink())).getArray();
        
        // find all the ucjs and check if each crunch implies the permission
        // if so, 2 cases
        //    1. account-based permission?
        //          check if related account is in the accounttemplate stored in ucj, if so return true if cap implies permission if not move on
        //          WHERE IS RELATED ACCOUNT ID THO
        //    2. global permission?
        //          return true if cap implies permission

        if ( isGlobal ) {
          for ( UserCapabilityJunction ucj : ucjs ) {
            Capability capability = (Capability) capabilityDAO.find(ucj.getTargetId());
            if ( capability.implies(x, permission) ) return getDelegate().checkUser(x, user, permission);
          }
        } else {
          Long relatedAccountId = 0L; // = ((ApprovableInterface)  obj).getOutgoingAccountId(); 
          // except we don't have object in authservice
          for ( UserCapabilityJunction ucj : ucjs ) {
            Capability capability = (Capability) capabilityDAO.find(ucj.getTargetId());
            if ( ((AccountTemplate) ucj.getData()).isParentOf(x, relatedAccountId) && capability.implies(x, permission) ) return getDelegate().checkUser(x, user, permission);
          }
        }

        // return getDelegate().checkUser(x, user, permission);
        return false;
      `
    }
  ]
});
  