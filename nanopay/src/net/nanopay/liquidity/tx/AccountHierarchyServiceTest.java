package net.nanopay.liquidity.tx;

import foam.core.*;
import foam.dao.*;
import foam.nanos.test.Test;
import foam.test.TestUtils;
import net.nanopay.liquidity.crunch.*;

import java.util.*;

import static foam.mlang.MLang.*;

public class AccountHierarchyServiceTest extends Test {
  public X system;
  public AccountHierarchyService service;
  public DAO accountDAO;
  public ApproverLevel al1, al2, al3;
  public CapabilityAccountData cad1, cad2, cad3;
  public AccountApproverMap result;
  public CapabilityAccountTemplate template;

  // test method - public AccountApproverMap getAccountsFromCapabilityAccountTemplate(X x, CapabilityAccountTemplate template)

  public void runTest(X x) {
    system = x.put("user", new foam.nanos.auth.User.Builder(x).setId(1).build());
    service = new AccountHierarchyService();
    accountDAO = (DAO) x.get("accountDAO");
    al1 = new ApproverLevel.Builder(x).setApproverLevel(1).build();
    al2 = new ApproverLevel.Builder(x).setApproverLevel(2).build();
    al3 = new ApproverLevel.Builder(x).setApproverLevel(3).build();
    cad1 = new CapabilityAccountData.Builder(x).setIsCascading(true).setIsIncluded(true).setApproverLevel(al1).build();
    cad2 = new CapabilityAccountData.Builder(x).setIsCascading(true).setIsIncluded(true).setApproverLevel(al2).build();
    cad3 = new CapabilityAccountData.Builder(x).setIsCascading(true).setIsIncluded(true).setApproverLevel(al3).build();

    testAccountTemplate(system);
  }

  public void testAccountTemplate(X x) {
    Map<String, CapabilityAccountData> map = new HashMap<String, CapabilityAccountData>();
    map.put("1105", cad1);
    map.put("1107", cad2);
    map.put("1109", cad3);
    template = new CapabilityAccountTemplate.Builder(x).setId(1).setTemplateName("test").setAccounts(map).build();
    result = foo(x, true, 1, null, template);
    System.out.println("1105 : " + result.getAccounts().get("1105")+"\n\n");
    System.out.println("1107 : " + result.getAccounts().get("1107")+"\n\n");
    System.out.println("1109 : " + result.getAccounts().get("1109")+"\n\n");

    printRoots((long) 1);
    printAccounts(result);
  }

  // for easier to type name
  public AccountApproverMap foo(foam.core.X x, boolean trackRootAccounts, long user, net.nanopay.liquidity.crunch.AccountApproverMap oldTemplate, net.nanopay.liquidity.crunch.CapabilityAccountTemplate template) {
    return service.getAssignedAccountMap(x, trackRootAccounts, user, oldTemplate, template);
  }
  public void newline() { System.out.println(); }

  public void printRoots(Long user) {
    HashSet<String> roots = service.userToViewableRootAccountsMap_.get(user);
    System.out.println("\n\nuser has root accounts : \n");
    for ( String root : roots ) {
      System.out.println("root --- " + root + "\n");
    }
  }
  public void printAccounts(AccountApproverMap result) {
    Map<String, CapabilityAccountData> map = result.getAccounts();
    System.out.println("\n\nuser has the map : \n");
    for ( Map.Entry<String, CapabilityAccountData> account : map.entrySet() ) {
      System.out.println(account.getKey() + " --- " + account.getValue()+ "\n");
    }
  }

}
