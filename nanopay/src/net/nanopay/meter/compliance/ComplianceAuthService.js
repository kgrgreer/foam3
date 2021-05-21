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
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: `AuthService Decorator that checks if the user business or account 
                  have passed compliance, and if they have any blacklisted permissions.`,

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'DAO blacklistDAO',
    'ComplianceService complianceService'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Group',
    'foam.nanos.logger.Logger',
    'foam.nanos.NanoService',
    'java.security.Permission',
    'javax.security.auth.AuthPermission',
    'net.nanopay.meter.Blacklist',
    'net.nanopay.meter.BlacklistEntityType',
    'net.nanopay.meter.compliance.ComplianceService'
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
        if ( getDelegate() instanceof NanoService ) {
          ((NanoService) getDelegate()).start();
        }
      `
    },
    {
      name: 'check',
      type: 'Boolean',
      javaCode: `
        ComplianceService complianceService = (ComplianceService) getComplianceService();
        Permission permission_ = new AuthPermission(permission);
    
        try {
          Group userBlacklist = (Group) ((DAO) getBlacklistDAO()).find(
            MLang.EQ(Blacklist.ENTITY_TYPE, BlacklistEntityType.USER)
          );
          if ( userBlacklist != null && userBlacklist.implies(x, permission_)
            && ! complianceService.checkUserCompliance(x)
          ) {
            throw new AuthorizationException("Permission denied. User compliance check failed for permission: " + permission);
          }

          Group businessBlacklist = (Group) ((DAO) getBlacklistDAO()).find(
            MLang.EQ(Blacklist.ENTITY_TYPE, BlacklistEntityType.BUSINESS)
          );
          if ( businessBlacklist != null && businessBlacklist.implies(x, permission_)
            && ! complianceService.checkBusinessCompliance(x)
          ) {
            throw new AuthorizationException("Permission denied. Business compliance check failed for permission: " + permission);
          }

          Group accountBlacklist = (Group) ((DAO) getBlacklistDAO()).find(
            MLang.EQ(Blacklist.ENTITY_TYPE, BlacklistEntityType.ACCOUNT)
          );
          if ( accountBlacklist != null && accountBlacklist.implies(x, permission_)
            && ! complianceService.checkAccountCompliance(x)
          ) {
            throw new AuthorizationException("Permission denied. Account compliance check failed for permission: " + permission);
          }
        } catch ( AuthorizationException ae ) {
          Logger logger = (Logger) x.get("logger");
          logger.error("compliance check", permission, ae);

          // When an authorization exception is thrown, the permission check has failed
          return false;
        }
    
        // Otherwise continue with the normal permission check
        return getDelegate().check(x, permission);
      `
    }
  ]

});

