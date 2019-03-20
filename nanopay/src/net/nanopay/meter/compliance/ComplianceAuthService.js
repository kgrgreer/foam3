foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: 'AuthService Decorator that checks if the user business or account have passed compliance, and if they have any blacklisted permissions',

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'blacklistDAO'
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
    'net.nanopay.meter.compliance.NanopayComplianceService'
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
        NanopayComplianceService complianceService = (NanopayComplianceService) x.get("complianceService");
        Permission permission_ = new AuthPermission(permission);
    
        if ( ! complianceService.checkUserCompliance(x) ) {
          ArraySink sink   = (ArraySink) ((DAO) getBlacklistDAO()).where(
            MLang.EQ(Blacklist.ENTITY_TYPE, BlacklistEntityType.USER)
          ).select(new ArraySink());
          assert sink.getArray().size() >= 1 : "User compliance blacklist does not exist";
          Group userBlacklist = (Group) sink.getArray().get(0);
          if ( userBlacklist.implies(x, permission_) ) {
            throw new AuthorizationException();
          }
        }
        if ( ! complianceService.checkBusinessCompliance(x) ) {
          ArraySink sink = (ArraySink) ((DAO) getBlacklistDAO()).where(
            MLang.EQ(Blacklist.ENTITY_TYPE, BlacklistEntityType.BUSINESS)
          ).select(new ArraySink());
          assert sink.getArray().size() >= 1 : "Business compliance blacklist does not exist";
          Group businessBlacklist = (Group) sink.getArray().get(0);
          if ( businessBlacklist.implies(x, permission_) ) {
            throw new AuthorizationException();
          }
        }
        if ( ! complianceService.checkAccountCompliance(x) ) {
          ArraySink sink = (ArraySink) ((DAO) getBlacklistDAO()).where(
            MLang.EQ(Blacklist.ENTITY_TYPE, BlacklistEntityType.ACCOUNT)
          ).select(new ArraySink());
          assert sink.getArray().size() >= 1 : "Account compliance blacklist does not exist";
          Group accountBlacklist = (Group) sink.getArray().get(0);
          if ( accountBlacklist.implies(x, permission_) ) {
            throw new AuthorizationException();
          }
        }
    
        return getDelegate().check(x, permission);
      `
    }
  ]

});

