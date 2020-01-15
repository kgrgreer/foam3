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
  public Map<Long, ArrayList<String>> userToViewableRootAccountsMap_; // getViewableAccountRoots(x, Long userId) {  }

  public AccountHierarchyService() { 
    userToViewableRootAccountsMap_ = new HashMap<Long, ArrayList<String>>();
    map_ = new HashMap<String, HashSet<Long>>();
  }

  public List<Account> getViewableRootAccounts(X x, Long userId) {
    DAO accountDAO = (DAO) x.get("localAccountDAO");

    List<Account> ret = new ArrayList<Account>();
    Set<String> roots = new HashSet<String>(userToViewableRootAccountsMap_.get(userId));
    if ( roots == null ) return null;

    for ( String root : roots ) {
      ret.add((Account) accountDAO.find(root));
    }
    return ret;
  }


  protected Map<String, HashSet<Long>> getChildMap(X x) {
    DAO accountDAO = (DAO) x.get("localAccountDAO");

    if ( map_ != null ) {
      return map_;
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
    map_ = new ConcurrentHashMap<String, HashSet<Long>>();
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
  public net.nanopay.liquidity.crunch.AccountApproverMap getAssignedAccountMap(foam.core.X x, boolean trackRootAccounts, long user, net.nanopay.liquidity.crunch.AccountApproverMap oldTemplate, net.nanopay.liquidity.crunch.CapabilityAccountTemplate template) {
    Map<String, CapabilityAccountData> oldMap = oldTemplate == null || oldTemplate.getAccounts() == null ? new HashMap<String, CapabilityAccountData>() : oldTemplate.getAccounts();
    Map<String, CapabilityAccountData> newMap = template.getAccounts();

    if ( newMap == null || newMap.size() == 0 ) throw new RuntimeException("Invalid accountTemplate");
    Set<String> accountIds = newMap.keySet();

    ArrayList<String> roots = trackRootAccounts ? 
    ( userToViewableRootAccountsMap_.containsKey(user) ? 
       userToViewableRootAccountsMap_.get(user) : 
       new ArrayList<String>() ) : 
     null;
    
    // pre-populate roots with the account template keys so that unnecessary ones will be removed during child finding process
    for ( String accountId : accountIds ) {
      if ( ( ! oldMap.containsKey(accountId) || (oldMap.containsKey(accountId) && roots.contains(accountId) ) ) && newMap.get(accountId).getIsIncluded() ) roots.add(accountId);
    }

    for ( String accountId : accountIds ) {
      CapabilityAccountData data = (CapabilityAccountData) newMap.get(accountId);
      if ( data.getIsIncluded() ) {
        newMap.put(accountId, data);
        if ( data.getIsCascading() ) {
          newMap = addChildrenToCapabilityAccountTemplate(x, accountId, newMap.get(accountId), roots, new HashMap<String, CapabilityAccountData>(newMap), new HashMap<String, CapabilityAccountData>(oldMap));
        } else {
          // since this account is not going thru addchildren, need to go thru its immediate children to make sure that they are not in the roots set
          List<Account> immediateChildren = ((ArraySink) ((Account) ((DAO) x.get("localAccountDAO")).find(accountId)).getChildren(x).select(new ArraySink())).getArray();
          for ( Account child : immediateChildren ) {
            roots.remove(String.valueOf(child.getId()));
          }
        }
      } 
    }
    oldMap.putAll(newMap);

    if ( trackRootAccounts ) userToViewableRootAccountsMap_.put(user, ((ArrayList<String>) roots));

    return new AccountApproverMap.Builder(x).setAccounts(oldMap).build();
  }

  private Map<String, CapabilityAccountData> addChildrenToCapabilityAccountTemplate(X x, String accountId, CapabilityAccountData data, ArrayList<String> roots, Map<String, CapabilityAccountData> accountMap, Map<String, CapabilityAccountData> oldMap){
    DAO accountDAO = (DAO) x.get("accountDAO");
    Account tempAccount = (Account) accountDAO.find(Long.parseLong(accountId));
    List<Account> children = ((ArraySink) ( tempAccount.getChildren(x)).select(new ArraySink())).getArray();

    Set<Account> accountsSet = new HashSet<Account>();

    while ( children.size() > 0 ) {
      if ( ! accountMap.containsKey(String.valueOf(children.get(0))) ) {
        tempAccount = children.get(0);
        accountsSet.add(tempAccount);
        List<Account> tempChildren = ((ArraySink) (tempAccount.getChildren(x)).select(new ArraySink())).getArray();
        for ( Account tempChild : tempChildren ) {
          if ( ! children.contains(tempChild) ) children.add(tempChild);
          accountsSet.add(tempChild);
        }
      }
      children.remove(0);
    }

    String aid;
    for ( Account account : accountsSet ) {
      aid = String.valueOf(account.getId());
      if ( ! accountMap.containsKey(aid) ) accountMap.put(aid, data);
      if ( roots.contains(aid) ) roots.remove(aid);
    }
    return accountMap;
  }

  @Override
  public AccountApproverMap getAccountsFromCapabilityAccountTemplate(X x, CapabilityAccountTemplate template) {
    return null;
  }


  @Override
  public AccountMap getAccountsFromAccountTemplate(X x, AccountTemplate template){
    // TODO: Wire up caching
    Map<String, AccountData> templateMap = template.getAccounts();
    Set<String> accountIds = templateMap.keySet();

    Map<String, AccountData> finalMap = new ConcurrentHashMap<>();

    for ( String accountId : accountIds ) {
      finalMap.put(accountId, templateMap.get(accountId));
      addChildrenToAccountTemplate(x, accountId, templateMap.get(accountId), finalMap);
    }

    return new AccountMap.Builder(x).setAccounts(finalMap).build();

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


  @Override
  public net.nanopay.liquidity.crunch.AccountApproverMap getRevokedAccountsMap(foam.core.X x, boolean trackRootAccounts, long user, net.nanopay.liquidity.crunch.AccountApproverMap oldTemplate, net.nanopay.liquidity.crunch.CapabilityAccountTemplate template) {
    Map<String, CapabilityAccountData> oldMap = oldTemplate == null || oldTemplate.getAccounts() == null ? new HashMap<String, CapabilityAccountData>() : oldTemplate.getAccounts();
    Map<String, CapabilityAccountData> newMap = template.getAccounts();

    if ( newMap == null || newMap.size() == 0 ) throw new RuntimeException("Invalid accountTemplate");
    Set<String> accountIds = newMap.keySet();

    ArrayList<String> roots = new ArrayList<String>();
    
    // pre-populate roots with the account template keys so that unnecessary ones will be removed during child finding process
    for ( String accountId : accountIds ) {
      if ( newMap.get(accountId).getIsIncluded() ) roots.add(accountId);
    }

    for ( String accountId : accountIds ) {
      CapabilityAccountData data = (CapabilityAccountData) newMap.get(accountId);
      if ( data.getIsIncluded() ) {
        newMap.put(accountId, data);
        if ( data.getIsCascading() ) {
          newMap = addChildrenToCapabilityAccountTemplate(x, accountId, newMap.get(accountId), roots, new HashMap<String, CapabilityAccountData>(newMap), new HashMap<String, CapabilityAccountData>(oldMap));
        } else {
          // since this account is not going thru addchildren, need to go thru its immediate children to make sure that they are not in the roots set
          List<Account> immediateChildren = ((ArraySink) ((Account) ((DAO) x.get("localAccountDAO")).find(accountId)).getChildren(x).select(new ArraySink())).getArray();
          for ( Account child : immediateChildren ) {
            roots.remove(String.valueOf(child.getId()));
          }
        }
      } 
    }

    if ( trackRootAccounts ) {
      ArrayList<String> currentRoots = new ArrayList<String>(userToViewableRootAccountsMap_.get(user));
      if ( currentRoots == null || currentRoots.size() == 0 ) throw new RuntimeException("Revoke cannot be performed since user does not have any accounts authorized for this capability."); 
      for ( String root : roots ) {
        if ( oldMap.containsKey(root) ) {
          List<Account> immediateChildren = ((ArraySink) ((Account) ((DAO) x.get("localAccountDAO")).find(root)).getChildren(x).select(new ArraySink())).getArray();
          for ( Account child : immediateChildren ) {
            if (oldMap.containsKey(String.valueOf(child.getId())) && ! newMap.containsKey(String.valueOf(child.getId())) ) currentRoots.add(String.valueOf(child.getId()));
          }
          currentRoots.remove(root);
        }
      }
      userToViewableRootAccountsMap_.put(user, currentRoots);
    }

    oldMap.keySet().removeAll(newMap.keySet());

    return new AccountApproverMap.Builder(x).setAccounts(oldMap).build();
  }
}
