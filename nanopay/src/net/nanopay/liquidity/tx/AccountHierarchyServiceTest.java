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
// TODO: fix after using string id in account
public class AccountHierarchyServiceTest extends Test {
  public X system;
  public AccountHierarchyService service;
  public DAO accountDAO, ucjDAO, capabilityDAO, accountTemplateDAO;
  public NumberSet result;
  public AccountTemplate template;
  public long a0, a1, a2, a3, a4, a5, a6, a7, a8, a9;
  public User user;
  public Capability c;
  public UserCapabilityJunction ucj;

  public void runTest(X x) {
    // service = new AccountHierarchyService();
    // accountDAO = (DAO) x.get("localAccountDAO");
    // capabilityDAO = (DAO) x.get("localCapabilityDAO");
    // accountTemplateDAO = (DAO) x.get("accountTemplateDAO");
    // x = TestUtils.mockDAO(x, "userCapabilityJunctionDAO");
    // ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
    // Subject subject = new Subject.Builder(x).setUser(new foam.nanos.auth.User.Builder(x).setId(1).build()).build();
    // system = x.put("subject", subject);

    // user = new foam.nanos.auth.User.Builder(x).setId(88).build();
    // c = (LiquidCapability) capabilityDAO.find("viewAccount"); // viewAccount

    // testAccountTemplate(system);
  }

  // public void testAccountTemplate(X x) {
  //   a0 = 1757;
  //   a1 = 1763;
  //   a2 = 1791;

  //   List<Long> aL = new ArrayList<>();
  //   aL.add(a0);
  //   aL.add(a1);
  //   aL.add(a2);

  //   List<Long> rL = new ArrayList<>();
  //   aL.add(a0);

  //   AccountTemplate at = new AccountTemplate.Builder(x).setId("test").setTemplateName("testTemplate1").setAccounts(aL).setRoots(rL).build();
    
  //   assign(x, ucj, at);
  // }

  // public void assign(X x, UserCapabilityJunction ucj, AccountTemplate at) {
  //   System.out.println("\n\nAssigning ------------------------------------------------------------------------");

  //   result = foo(x, user.getId(), ucj, at);

  //   printRoots(x, user.getId());
  //   printAccounts(result);
  //   updateUcj(x, result);
  // }

  // // for easier to type name
  // public NumberSet foo(foam.core.X x, long user, UserCapabilityJunction ucj, AccountTemplate at) {
  //   NumberSet newData = new NumberSet();
  //   Set<Long> newDataSet = new HashSet<>(at.getAccounts());
  //   newData.setAsRealSet(newDataSet);

  //   NumberSet oldData= ucj == null ? null : (NumberSet) ucj.getData();

  //   List<Long> uL = new ArrayList<>();
  //   uL.add(user);

  //   // Handle adding roots
  //   service.addViewableRootAccounts(x, uL, at.getRoots());

  //   if ( oldData == null || ! ( oldData instanceof NumberSet ) ){
  //     throw new RuntimeException("Data should not be null, should be a numberSet");
  //   }

  //   Set<Long> oldDataSet = new HashSet<>(oldData.getAsRealSet());

  //   newDataSet.addAll(oldDataSet);

  //   newData.setAsRealSet(newDataSet);

  //   return newData;
  // }

  // public void newline() { System.out.println(); }

  // public void printRoots(X x, Long user) {
  //   List<Account> roots = service.getViewableRootAccounts(x, user);
  //   System.out.println("\n\nuser has root accounts : ");
  //   for ( Account root : roots ) {
  //     System.out.println("root --- " + root.getId());
  //   }
  // }
  // public void printAccounts(NumberSet result) {
  //   Set<Long> set = result.getAsRealSet();
  //   System.out.println("\n\nuser has the NumberSet : ");
  //   for ( Long accountId : set ) {
  //     System.out.println(accountId);
  //   }
  // }

  // public void updateUcj(X x, NumberSet result) {
  //   ucj = new UserCapabilityJunction.Builder(x).setSourceId(user.getId()).setTargetId(c.getId()).setData(result).build();
  //   ucj = (UserCapabilityJunction) ucjDAO.put_(x, ucj);
  //   System.out.println("added capability to user.");
  // }

}
