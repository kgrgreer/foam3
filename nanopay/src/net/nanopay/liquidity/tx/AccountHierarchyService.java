package net.nanopay.liquidity.tx;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Sink;
import java.util.concurrent.ConcurrentHashMap;
import java.util.*;
import net.nanopay.account.Account;
import net.nanopay.liquidity.crunch.*;

import static foam.mlang.MLang.TRUE;

public class AccountHierarchyService
  implements AccountHierarchy
{
  protected Map<String, HashSet<Long>> map_;

  protected Map<String, HashSet<Long>> getChildMap(X x) {
    DAO accountDAO = (DAO) x.get("localAccountDAO");

    if ( map_ == null ) {
      map_ = new ConcurrentHashMap<String, HashSet<Long>>();
    }

    Sink purgeSink = new Sink() {
      public void put(Object obj, Detachable sub) {
        map_.clear();
        sub.detach();
      }
      public void remove(Object obj, Detachable sub) {
        map_.clear();
        sub.detach();
      }
      public void eof() {
      }
      public void reset(Detachable sub) {
        map_.clear();
        sub.detach();
      }
    };

    accountDAO.listen(purgeSink, TRUE);

    return map_;
  }

  @Override
  public HashSet<Long> getChildAccountIds(X x, long parentId) {
    Map <String, HashSet<Long>> map = getChildMap(x);
    DAO accountDAO = (DAO) x.get("localAccountDAO");
    String parentIdString = Long.toString(parentId);

    // Check if parentId exists in map, if it doesn't fetch children and add them to map
    if ( ! map.containsKey(parentIdString) ) {
      Account parentAccount = (Account) accountDAO.find(parentId);
      List<Account> children = new ArrayList<Account>();
      List<Long> childIdList = new ArrayList<Long>();

      children = getChildAccounts(x, parentAccount);

      if ( children.size() > 0 ) {
        for ( int i = 0; i < children.size(); i++ ) {
          long childId = children.get(i).getId();
          childIdList.add(childId);
        }
      }

      HashSet<Long> childIdSet = new HashSet<>(childIdList);
      map.put(parentIdString, childIdSet);
    }

    return map.get(parentIdString);
  }

  @Override
  public List<Account> getChildAccounts(X x, Account account) {
     ArraySink allChildrenSink = (ArraySink) account.getChildren(x).select(new ArraySink());
     List<Account> allChildrenList = allChildrenSink.getArray();
    
    List<Account> allAccounts = new ArrayList<Account>();
    allAccounts.add(account);

    if ( allChildrenList.size() > 0 ) {
      for ( int i = 0; i < allChildrenList.size(); i++ ) {
        Account acc = (Account) allChildrenList.get(i);
        List<Account> childChildren = getChildAccounts(x, acc);
        allAccounts.addAll(childChildren);
      }
    }

    return allAccounts;
  }

  @Override
  public AccountApproverMap getAccountsFromCapabilityAccountTemplate(X x, CapabilityAccountTemplate template){
    // TODO: Wire up caching
    Map<String, CapabilityAccountData> templateMap = template.getAccounts();
    Set<String> accountIds = templateMap.keySet();

    Map<String, CapabilityAccountData> finalMap = new HashMap<>();

    for ( String accountId : accountIds ) {
      finalMap.put(accountId, templateMap.get(accountId));
      addChildrenToCapabilityAccountTemplate(x, accountId, templateMap.get(accountId), finalMap);
    }

    return new AccountApproverMap.Builder(x).setAccounts(finalMap).build();
  }

  @Override
  public AccountMap getAccountsFromAccountTemplate(X x, AccountTemplate template){
    // TODO: Wire up caching
    Map<String, AccountData> templateMap = template.getAccounts();
    Set<String> accountIds = templateMap.keySet();

    Map<String, AccountData> finalMap = new HashMap<>();

    for ( String accountId : accountIds ) {
      finalMap.put(accountId, templateMap.get(accountId));
      addChildrenToAccountTemplate(x, accountId, templateMap.get(accountId), finalMap);
    }

    return new AccountMap.Builder(x).setAccounts(finalMap).build();

  }

  private void addChildrenToCapabilityAccountTemplate(X x, String accountId, CapabilityAccountData data, Map<String, CapabilityAccountData> accountMap){
    DAO accountDAO = (DAO) x.get("accountDAO");
    Account tempAccount = (Account) accountDAO.find(Long.parseLong(accountId));
    List<Account> children = ((ArraySink) ( tempAccount.getChildren(x)).select(new ArraySink())).getArray();

    Set<Account> accountsSet = new HashSet<>(children);
    accountsSet.addAll(children);

    while ( children.size() > 0 ) {
      tempAccount = children.get(0);
      List<Account> tempChildren = ((ArraySink) ( tempAccount.getChildren(x)).select(new ArraySink())).getArray();
      for ( Account tempChild : tempChildren ) {
        if ( ! children.contains(tempChild) ) children.add(tempChild);
        accountsSet.add(tempChild);
      }
      children.remove(0);
    }

    for ( Account account : accountsSet ) {
      if ( ! accountMap.containsKey(String.valueOf(account.getId()))) accountMap.put(String.valueOf(account.getId()), data);
    }
  }

  private void addChildrenToAccountTemplate(X x, String accountId, AccountData data, Map<String, AccountData> accountMap){
    DAO accountDAO = (DAO) x.get("accountDAO");
    Account tempAccount = (Account) accountDAO.find(Long.parseLong(accountId));
    List<Account> children = ((ArraySink) ( tempAccount.getChildren(x)).select(new ArraySink())).getArray();

    Set<Account> accountsSet = new HashSet<>(children);
    accountsSet.addAll(children);

    while ( children.size() > 0 ) {
      tempAccount = children.get(0);
      List<Account> tempChildren = ((ArraySink) ( tempAccount.getChildren(x)).select(new ArraySink())).getArray();
      for ( Account tempChild : tempChildren ) {
        if ( ! children.contains(tempChild) ) children.add(tempChild);
        accountsSet.add(tempChild);
      }
      children.remove(0);
    }

    for ( Account account : accountsSet ) {
      if ( ! accountMap.containsKey(String.valueOf(account.getId()))) accountMap.put(String.valueOf(account.getId()), data);
    }
  }
}
