package net.nanopay.liquidity.tx;

import foam.core.*;
import foam.dao.*;
import foam.nanos.test.Test;
import foam.nanos.auth.*;
import foam.test.TestUtils;
import foam.nanos.crunch.*;
import net.nanopay.liquidity.crunch.*;
import net.nanopay.account.Account;

import java.util.*;

import static foam.mlang.MLang.*;

// needs to be built in liquid
public class AccountHierarchyServiceTest extends Test {
  public X system;
  public AccountHierarchyService service;
  public DAO accountDAO, ucjDAO, capabilityDAO;
  public ApproverLevel al1, al2, al3;
  public CapabilityAccountData cad1, cad2, cad3;
  public AccountApproverMap result;
  public CapabilityAccountTemplate template;
  public String a0, a1, a2, a3, a4, a5, a6, a7, a8, a9;
  public User user;
  public Capability c;
  public UserCapabilityJunction ucj;

  public void runTest(X x) {
    service = new AccountHierarchyService();
    accountDAO = (DAO) x.get("accountDAO");
    x = TestUtils.mockDAO(x, "userCapabilityJunctionDAO");
    ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
    system = x.put("user", new foam.nanos.auth.User.Builder(x).setId(1).build());
    al1 = new ApproverLevel.Builder(x).setApproverLevel(1).build();
    al2 = new ApproverLevel.Builder(x).setApproverLevel(2).build();
    al3 = new ApproverLevel.Builder(x).setApproverLevel(3).build();
    cad1 = new CapabilityAccountData.Builder(x).setIsCascading(false).setIsIncluded(true).setApproverLevel(al1).build();
    cad2 = new CapabilityAccountData.Builder(x).setIsCascading(true).setIsIncluded(true).setApproverLevel(al2).build();
    cad3 = new CapabilityAccountData.Builder(x).setIsCascading(true).setIsIncluded(true).setApproverLevel(al3).build();

    user = new foam.nanos.auth.User.Builder(x).setId(88).build();
    c = new AccountBasedLiquidCapability.Builder(x).setId("test").setCanViewAccount(true).build();

    testAccountTemplate(system);
  }

  public void testAccountTemplate(X x) {
    Map<String, CapabilityAccountData> map = new HashMap<String, CapabilityAccountData>();

    a0 = "1757";
    a1 = "1763";
    a2 = "1791";

    map.put(a0, cad1);
    map.put(a1, cad2);
    map.put(a2, cad3);
    assign(x, ucj, map);

    map.clear();
    cad1.setIsCascading(true);
    cad1.setApproverLevel(al3);
    map.put("1765", cad1);
    assign(x, ucj, map);
    
    map.clear();
    cad1.setIsCascading(false);
    cad1.setIsIncluded(true);
    map.put("1757", cad1);
    revoke(x, ucj, map);

  }

  public void assign(X x, UserCapabilityJunction ucj, Map<String, CapabilityAccountData> map) {
    System.out.println("\n\nAssigning ------------------------------------------------------------------------");
    Set<String> assigned = map.keySet();
    for ( String id : assigned ) {
      System.out.println("id : " + id + "\t\tApproverLevel=" + map.get(id).getApproverLevel().getApproverLevel() + "\t\tIsCascading=" + map.get(id).getIsCascading() + "\t\tIsIncluded=" + map.get(id).getIsIncluded());
    }

    template = new CapabilityAccountTemplate.Builder(x).setAccounts(map).build();
    AccountApproverMap oldtemplate = ucj == null ? null : (AccountApproverMap) ucj.getData();
    result = foo(x, true, user.getId(), (AccountApproverMap) oldtemplate, template);

    printRoots(x, user.getId());
    printAccounts(result);
    updateUcj(x, result);
  }

  public void revoke(X x, UserCapabilityJunction ucj, Map<String, CapabilityAccountData> map) {
    System.out.println("\n\nRevoking ------------------------------------------------------------------------");
    Set<String> revoked = map.keySet();
    for ( String id : revoked ) {
      System.out.println("id : " + id + "\t\tApproverLevel=" + map.get(id).getApproverLevel().getApproverLevel() + "\t\tIsCascading=" + map.get(id).getIsCascading() + "\t\tIsIncluded=" + map.get(id).getIsIncluded());
    }

    template = new CapabilityAccountTemplate.Builder(x).setAccounts(map).build();
    AccountApproverMap oldtemplate = ucj == null ? null : (AccountApproverMap) ucj.getData();
    result = bar(x, true, user.getId(), (AccountApproverMap) oldtemplate, template);

    printRoots(x, user.getId());
    printAccounts(result);
    updateUcj(x, result);
  }

  // for easier to type name
  public AccountApproverMap foo(foam.core.X x, boolean trackRootAccounts, long user, net.nanopay.liquidity.crunch.AccountApproverMap oldTemplate, net.nanopay.liquidity.crunch.CapabilityAccountTemplate template) {
    return service.getAssignedAccountMap(x, trackRootAccounts, user, oldTemplate, template);
  }

  public AccountApproverMap bar(foam.core.X x, boolean trackRootAccounts, long user, net.nanopay.liquidity.crunch.AccountApproverMap oldTemplate, net.nanopay.liquidity.crunch.CapabilityAccountTemplate template) {
    return service.getRevokedAccountsMap(x, trackRootAccounts, user, oldTemplate, template);
  }

  public void newline() { System.out.println(); }

  public void printRoots(X x, Long user) {
    List<Account> roots = service.getViewableRootAccounts(x, user);
    System.out.println("\n\nuser has root accounts : ");
    for ( Account root : roots ) {
      System.out.println("root --- " + root.getId());
    }
  }
  public void printAccounts(AccountApproverMap result) {
    Map<String, CapabilityAccountData> map = result.getAccounts();
    System.out.println("\n\nuser has the map : ");
    for ( Map.Entry<String, CapabilityAccountData> account : map.entrySet() ) {
      System.out.println(account.getKey() + " --- " + account.getValue());
    }
  }

  public void updateUcj(X x, AccountApproverMap result) {
    ucj = new UserCapabilityJunction.Builder(x).setSourceId(user.getId()).setTargetId(c.getId()).setData(result).build();
    ucj = (UserCapabilityJunction) ucjDAO.put_(x, ucj);
    System.out.println("added capability to user.");
  }

}
