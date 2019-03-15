package net.nanopay.meter.compliance;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.Group;
import foam.nanos.auth.ProxyAuthService;
import java.security.Permission;
import javax.security.auth.AuthPermission;
import net.nanopay.meter.Blacklist;
import net.nanopay.meter.BlacklistEntityType;

public class ComplianceAuthService extends ProxyAuthService  {

  public ComplianceAuthService(X x, AuthService delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public boolean check(X x, String permission) {
    NanopayComplianceService complianceService = (NanopayComplianceService) x.get("complianceService");
    DAO blacklistDAO = (DAO) x.get("blacklistDAO");

    Permission permission_ = new AuthPermission(permission);

    if ( ! complianceService.checkUserCompliance(x) ) {
      ArraySink sink   = (ArraySink) blacklistDAO.where(
        MLang.EQ(Blacklist.ENTITY_TYPE, BlacklistEntityType.USER)
      ).select(new ArraySink());
      assert sink.getArray().size() >= 1 : "User compliance blacklist does not exist";
      Group userBlacklist = (Group) sink.getArray().get(0);
      if ( userBlacklist.implies(x, permission_) ) {
        throw new AuthorizationException();
      }
    }
    if ( ! complianceService.checkBusinessCompliance(x) ) {
      ArraySink sink = (ArraySink) blacklistDAO.where(
        MLang.EQ(Blacklist.ENTITY_TYPE, BlacklistEntityType.BUSINESS)
      ).select(new ArraySink());
      assert sink.getArray().size() >= 1 : "Business compliance blacklist does not exist";
      Group businessBlacklist = (Group) sink.getArray().get(0);
      if ( businessBlacklist.implies(x, permission_) ) {
        throw new AuthorizationException();
      }
    }
    if ( ! complianceService.checkAccountCompliance(x) ) {
      ArraySink sink = (ArraySink) blacklistDAO.where(
        MLang.EQ(Blacklist.ENTITY_TYPE, BlacklistEntityType.ACCOUNT)
      ).select(new ArraySink());
      assert sink.getArray().size() >= 1 : "Account compliance blacklist does not exist";
      Group accountBlacklist = (Group) sink.getArray().get(0);
      if ( accountBlacklist.implies(x, permission_) ) {
        throw new AuthorizationException();
      }
    }

    return getDelegate().check(x, permission);
 }
}
