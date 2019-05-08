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
    'blacklistDAO',
    'complianceService'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Group',
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
    
        if ( ! complianceService.checkUserCompliance(x) ) {
          Group userBlacklist   = (Group) ((DAO) getBlacklistDAO()).find(
            MLang.EQ(Blacklist.ENTITY_TYPE, BlacklistEntityType.USER)
          );
          assert userBlacklist != null : "User compliance blacklist does not exist";
          if ( userBlacklist.implies(x, permission_) ) {
            throw new AuthorizationException();
          }
        }
        if ( ! complianceService.checkBusinessCompliance(x) ) {
          Group businessBlacklist = (Group) ((DAO) getBlacklistDAO()).find(
            MLang.EQ(Blacklist.ENTITY_TYPE, BlacklistEntityType.BUSINESS)
          );
          assert businessBlacklist != null : "Business compliance blacklist does not exist";
          if ( businessBlacklist.implies(x, permission_) ) {
            throw new AuthorizationException();
          }
        }
        if ( ! complianceService.checkAccountCompliance(x) ) {
          Group accountBlacklist = (Group) ((DAO) getBlacklistDAO()).find(
            MLang.EQ(Blacklist.ENTITY_TYPE, BlacklistEntityType.ACCOUNT)
          );
          assert accountBlacklist != null : "Account compliance blacklist does not exist";
          if ( accountBlacklist.implies(x, permission_) ) {
            throw new AuthorizationException();
          }
        }
    
        return getDelegate().check(x, permission);
      `
    }
  ]

});

