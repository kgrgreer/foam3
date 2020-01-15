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
  // test method - public AccountApproverMap getAccountsFromCapabilityAccountTemplate(X x, CapabilityAccountTemplate template)

  public void runTest(X x) {
    system = x.put("user", new foam.nanos.auth.User.Builder(x).setId(1).build());
    service = new AccountHierarchyService();
    accountDAO = (DAO) x.get("accountDAO");
    ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
    capabilityDAO = (DAO) x.get("accountBasedLiquidCapabilityDAO");
    al1 = new ApproverLevel.Builder(x).setApproverLevel(1).build();
    al2 = new ApproverLevel.Builder(x).setApproverLevel(2).build();
    al3 = new ApproverLevel.Builder(x).setApproverLevel(3).build();
    cad1 = new CapabilityAccountData.Builder(x).setIsCascading(false).setIsIncluded(true).setApproverLevel(al1).build();
    cad2 = new CapabilityAccountData.Builder(x).setIsCascading(true).setIsIncluded(true).setApproverLevel(al2).build();
    cad3 = new CapabilityAccountData.Builder(x).setIsCascading(true).setIsIncluded(true).setApproverLevel(al3).build();

    user = new foam.nanos.auth.User.Builder(x).setId(88).build();
    c = (AccountBasedLiquidCapability) capabilityDAO.find("corporateAdminAccountBased");

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
    template = new CapabilityAccountTemplate.Builder(x).setId(1).setTemplateName("test").setAccounts(map).build();
    result = foo(x, true, user.getId(), null, template);
    System.out.println(a0 + " : " + result.getAccounts().get(a0)+"\n\n");
    System.out.println(a1 + " : " + result.getAccounts().get(a1)+"\n\n");
    System.out.println(a2 + " : " + result.getAccounts().get(a2)+"\n\n");

    printRoots(system, user.getId());
    printAccounts(result);
    updateUcj(system, result);

    map.clear();
    map.put("1103", cad3);
    template = new CapabilityAccountTemplate.Builder(system).setId(2).setTemplateName("test2").setAccounts(map).build();
    result = foo(system, true, user.getId(), (AccountApproverMap) ucj.getData(), template);

    printRoots(system, user.getId());
    printAccounts(result);
    updateUcj(system, result);

    map.clear();
    cad1.setIsCascading(true);
    map.put("1755", cad1);
    template = new CapabilityAccountTemplate.Builder(system).setId(3).setTemplateName("test3").setAccounts(map).build();
    result = foo(system, true, user.getId(), (AccountApproverMap) ucj.getData(), template);

    printRoots(system, user.getId());
    printAccounts(result);
    updateUcj(system, result);

  }

  // for easier to type name
  public AccountApproverMap foo(foam.core.X x, boolean trackRootAccounts, long user, net.nanopay.liquidity.crunch.AccountApproverMap oldTemplate, net.nanopay.liquidity.crunch.CapabilityAccountTemplate template) {
    return service.getAssignedAccountMap(x, trackRootAccounts, user, oldTemplate, template);
  }
  public void newline() { System.out.println(); }

  public void printRoots(X x, Long user) {
    List<Account> roots = service.getViewableRootAccounts(x, user);
    System.out.println("\n\nuser has root accounts : \n");
    for ( Account root : roots ) {
      System.out.println("root --- " + root.getId() + "\n");
    }
  }
  public void printAccounts(AccountApproverMap result) {
    Map<String, CapabilityAccountData> map = result.getAccounts();
    System.out.println("\n\nuser has the map : \n");
    for ( Map.Entry<String, CapabilityAccountData> account : map.entrySet() ) {
      System.out.println(account.getKey() + " --- " + account.getValue()+ "\n");
    }
  }

  public void updateUcj(X x, AccountApproverMap result) {
    ucj = new UserCapabilityJunction.Builder(x).setSourceId(user.getId()).setTargetId(c.getId()).setData(result).build();
    ucj = (UserCapabilityJunction) ucjDAO.put_(x, ucj);
    System.out.println("added capability to user.");
  }

}
