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
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidCapability',
  extends: 'foam.nanos.crunch.Capability',
  
  javaImports: [
    'foam.core.FObject',
    'foam.core.NumberSet',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.HashSet',
    'java.util.List',
    'java.util.Set',
    'javax.security.auth.AuthPermission',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'of',
      javaFactory: ` return foam.core.NumberSet.getOwnClassInfo(); `,
      hidden: true,
      documentation: `
      Class of the information stored in data field of UserCapabilityJunctions, if there is any.
      For non-account based liquid capabilities it is null, but for account-Based liquid capabilities it is
      a number set. 
      `
    },
    {
      class: 'Boolean',
      name: 'isAccountBased'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function(x) {
        return this.name || this.id;
      },
      javaCode: `
        return foam.util.SafetyUtil.isEmpty(getName()) ?  getId() : getName();
      `
    },
    {
      name: 'implies',
      documentation: `
        Takes a permission string in the form of "booleanPropertyName.outgoingAccountId", and
        checks if the boolean property is checked.
        If so, find the ucj and check if the outgoingAccountId is in the accountTemplate map or a child of
        an account in the accountTemplate map stored in the ucj.
      `,
      javaCode: `
        Logger logger    = (Logger) getX().get("logger");
        String[] permissionsGranted = this.getPermissionsGranted();
        for ( String permissionName : permissionsGranted ) {
          if ( new AuthPermission(permissionName).implies(new AuthPermission(permission)) ) return true;
        }

        try {
          String[] permissionComponents = permission.split("\\\\.");

          if ( getIsAccountBased() ){
            if ( permissionComponents.length != 3 ) {
              logger.error("The permission string was not generated properly should never happen: " + permission);
              throw new RuntimeException("The permission string was not generated properly should never happen: " + permission);
            }
            String permObj = permissionComponents[0];
            String permOperation = permissionComponents[1];
            String outgoingAccountId = permissionComponents[2];
  
            String permToName = permOperation + permObj;
  
            if ( SafetyUtil.equals(this.getName().toLowerCase(), permToName.toLowerCase()) ) {
              UserCapabilityJunction ucj = (UserCapabilityJunction) ((DAO) x.get("userCapabilityJunctionDAO")).find(AND(
                EQ(UserCapabilityJunction.SOURCE_ID, ((Subject) x.get("subject")).getUser().getId()),
                EQ(UserCapabilityJunction.TARGET_ID, getId())
              ));
              if ( ucj == null ) return false;
  
              NumberSet ucjdata =  (NumberSet) ucj.getData();
              if ( ucjdata == null || ! ( ucjdata instanceof NumberSet ) ) return false;
  
              if ( ucjdata.contains(Long.parseLong(outgoingAccountId)) ) return true;
            }

            return false;
          } else {
            if ( permissionComponents.length != 2 ) {
              logger.error("The permission string was not generated properly should never happen: " + permission);
              throw new RuntimeException("The permission string was not generated properly should never happen: " + permission);
            }
            String permObj = permissionComponents[0];
            String permOperation = permissionComponents[1];
  
            if ( "liquidcapability".equals(permObj) ) permObj = "capability";
  
            String permToName = permOperation + permObj;
  
            return SafetyUtil.equals(this.getName().toLowerCase(), permToName.toLowerCase());
          }
        } catch ( java.lang.Exception e ) {
          return false;
        }
      `
    }
  ]
});
